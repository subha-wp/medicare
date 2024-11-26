import React from "react";
import LoginPage from "./LoginPage";

import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await validateRequest();

  if (session.user) redirect("/dashboard");
  return (
    <>
      <LoginPage />
    </>
  );
}
