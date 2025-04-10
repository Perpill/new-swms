import { db } from "./dbConfig";
import {
  Users,
  Reports,
  Rewards,
  CollectedWastes,
  Notifications,
  Transactions,
} from "./schema";
import { eq, sql, and, desc, ne } from "drizzle-orm";
import { Pool } from 'pg';

// Type definitions for better type safety
type User = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  phone: string;
  role: string;
  createdAt: Date;
};

type Report = {
  id: number;
  userId: number;
  location: string;
  wasteType: string;
  amount: string;
  imageUrl?: string;
  verificationResult?: any;
  status: string;
  createdAt: Date;
  collectorId?: number;
};

// Connection pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

// Utility function for handling database connections
async function withConnection<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// User Actions
export async function createUser(userData: {
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  role: string;
}): Promise<User | null> {
  return withConnection(async () => {
    try {
      const [user] = await db.insert(Users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return withConnection(async () => {
    try {
      const [user] = await db.select()
        .from(Users)
        .where(eq(Users.email, email));
      return user || null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  });
}

// Report Actions
export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  verificationResult?: any
): Promise<Report | null> {
  return withConnection(async () => {
    try {
      const [report] = await db.insert(Reports)
        .values({
          userId,
          location,
          wasteType,
          amount,
          imageUrl,
          verificationResult,
          status: "pending",
        })
        .returning();

      // Award points transaction
      const pointsEarned = 10;
      await db.transaction(async (tx) => {
        await updateRewardPoints(userId, pointsEarned);
        await createTransaction(
          userId,
          "earned_report",
          pointsEarned,
          "Points earned for reporting waste"
        );
        await createNotification(
          userId,
          `You've earned ${pointsEarned} points for reporting waste!`,
          "reward"
        );
      });

      return report;
    } catch (error) {
      console.error("Error creating report:", error);
      return null;
    }
  });
}

export async function getReportsByUserId(userId: number): Promise<Report[]> {
  return withConnection(async () => {
    try {
      return await db.select()
        .from(Reports)
        .where(eq(Reports.userId, userId));
    } catch (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
  });
}

// Reward Actions
export async function getOrCreateReward(userId: number) {
  return withConnection(async () => {
    try {
      let [reward] = await db.select()
        .from(Rewards)
        .where(eq(Rewards.userId, userId));

      if (!reward) {
        [reward] = await db.insert(Rewards)
          .values({
            userId,
            name: "Default Reward",
            collectionInfo: "Default Collection Info",
            points: 0,
            level: 1,
            isAvailable: true,
          })
          .returning();
      }
      return reward;
    } catch (error) {
      console.error("Error getting or creating reward:", error);
      return null;
    }
  });
}

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
  return withConnection(async () => {
    try {
      const [updatedReward] = await db.update(Rewards)
        .set({
          points: sql`${Rewards.points} + ${pointsToAdd}`,
          updatedAt: sql`NOW()`,
        })
        .where(eq(Rewards.userId, userId))
        .returning();
      return updatedReward;
    } catch (error) {
      console.error("Error updating reward points:", error);
      return null;
    }
  });
}

// Transaction Actions
export async function createTransaction(
  userId: number,
  type: "earned_report" | "earned_collect" | "redeemed",
  amount: number,
  description: string
) {
  return withConnection(async () => {
    try {
      const [transaction] = await db.insert(Transactions)
        .values({ 
          userId, 
          type, 
          amount, 
          description,
          date: sql`NOW()`
        })
        .returning();
      return transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  });
}

// Enhanced query with joins
export async function getAllRewardsWithUsers() {
  return withConnection(async () => {
    try {
      return await db.select({
          id: Rewards.id,
          userId: Rewards.userId,
          points: Rewards.points,
          level: Rewards.level,
          createdAt: Rewards.createdAt,
          userName: Users.name,
          userEmail: Users.email,
        })
        .from(Rewards)
        .innerJoin(Users, eq(Rewards.userId, Users.id))
        .orderBy(desc(Rewards.points));
    } catch (error) {
      console.error("Error fetching all rewards with users:", error);
      return [];
    }
  });
}

// Batch operations with transactions
export async function processDailyRewards() {
  return withConnection(async () => {
    try {
      await db.transaction(async (tx) => {
        // Get all active users
        const users = await tx.select({ id: Users.id })
          .from(Users)
          .where(ne(Users.role, '0')); // Exclude inactive users

        // Add daily bonus points
        for (const user of users) {
          await tx.update(Rewards)
            .set({
              points: sql`${Rewards.points} + 5`,
              updatedAt: sql`NOW()`,
            })
            .where(eq(Rewards.userId, user.id));

          await tx.insert(Transactions)
            .values({
              userId: user.id,
              type: "earned_collect",
              amount: 5,
              description: "Daily activity bonus",
              date: sql`NOW()`,
            });
        }
      });
    } catch (error) {
      console.error("Error processing daily rewards:", error);
      throw error;
    }
  });
}

// Optimized queries with prepared statements
export async function getPaginatedReports(page: number = 1, pageSize: number = 10) {
  return withConnection(async () => {
    try {
      const offset = (page - 1) * pageSize;
      return await db.select()
        .from(Reports)
        .orderBy(desc(Reports.createdAt))
        .limit(pageSize)
        .offset(offset);
    } catch (error) {
      console.error("Error fetching paginated reports:", error);
      return [];
    }
  });
}

// Clean up connection pool
process.on('beforeExit', async () => {
  await pool.end();
});