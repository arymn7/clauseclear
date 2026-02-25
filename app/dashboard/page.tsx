import { requireSessionUser } from "../../lib/auth-session";
import UploadForm from "../../components/upload-form";

export default async function DashboardPage() {
  const user = await requireSessionUser();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Signed in as {user.email}</p>
      <UploadForm />
    </main>
  );
}
