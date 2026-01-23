import { getServerSession } from "next-auth";
import type { GetServerSideProps } from "next";
import { authOptions } from "../api/auth/[...nextauth]";

export default function NewRepairRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false }
    };
  }
  return {
    redirect: { destination: "/", permanent: false }
  };
};
