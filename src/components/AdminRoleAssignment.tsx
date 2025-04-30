// components/AdminRoleAssignment.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAllUsers, updateUserRole } from "@/utils/db/actions";
import { db } from "@/utils/db/dbConfig";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function AdminRoleAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setUsers(users || []);
      } catch (err) {
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      setError("Failed to update user role");
      console.error(err);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Current Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{user.id}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">
                {user.role === "2"
                  ? "Admin"
                  : user.role === "1"
                  ? "Collector"
                  : "Reporter"}
              </td>
              <td className="py-2 px-4 border-b space-x-2">
                <Button
                  variant={user.role === "2" ? "default" : "outline"}
                  onClick={() => handleRoleChange(user.id, "2")}
                  disabled={user.role === "2"}
                >
                  Make Admin
                </Button>
                <Button
                  variant={user.role === "1" ? "default" : "outline"}
                  onClick={() => handleRoleChange(user.id, "1")}
                  disabled={user.role === "1"}
                >
                  Make Collector
                </Button>
                <Button
                  variant={user.role === "0" ? "default" : "outline"}
                  onClick={() => handleRoleChange(user.id, "0")}
                  disabled={user.role === "0"}
                >
                  Make Reporter
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
