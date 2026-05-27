import { Inngest } from "inngest";
import prisma from "../config/prisma.js";

export const inngest = new Inngest({ id: "SyncManage" });

/* ---------------- CREATE USER ---------------- */
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: { event: "clerk/user.created" },
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url ?? "",
      },
    });
  },
);

/* ---------------- DELETE USER ---------------- */
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    triggers: { event: "clerk/user.deleted" },
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: { id: data.id },
    });
  },
);

/* ---------------- UPDATE USER ---------------- */
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: { event: "clerk/user.updated" },
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url ?? "",
      },
    });
  },
);

/* export list */
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];

// Diagnostics to verify Inngest function registration
console.log(
  "[inngest] inngest.createFunction type:",
  typeof inngest.createFunction,
);
console.log("[inngest] syncUserCreation defined:", !!syncUserCreation);
console.log("[inngest] syncUserDeletion defined:", !!syncUserDeletion);
console.log("[inngest] syncUserUpdation defined:", !!syncUserUpdation);
console.log(
  "[inngest] functions array valid entries:",
  functions.map((f) => !!f),
);
