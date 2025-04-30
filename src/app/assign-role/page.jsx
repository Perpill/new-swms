// app/admin/assign-roles/page.tsx
import { redirect } from "next/navigation";
// import { getSession } from "@/lib/auth";
import AdminRoleAssignment from "@/components/AdminRoleAssignment";

export default async function AssignRolesPage() {
  // const session = await getSession();

  // Redirect non-admins
  // if (session?.user.role !== "2") {
  //   redirect("/unauthorized");
  // }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Role Management</h1>
      <AdminRoleAssignment />
    </div>
  );
}
