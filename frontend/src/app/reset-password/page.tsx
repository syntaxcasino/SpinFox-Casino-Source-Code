import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-white">Loading reset form...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
