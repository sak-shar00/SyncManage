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
  }
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
  }
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
  }
);

//inges functon to save workspace
const SyncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
  },
  { event: "clerk/organization.created" },

  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspace.create({
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          image_url: data.image_url ?? "",
          ownerId: data.created_by,
        },
      });

      //add  crateer as admin menerber 
          await prisma.workspaceMember.create({

        data: {

          userId: data.created_by,

          workspaceId: data.id,

          role: "ADMIN",

        },

      });

      console.log("Workspace created successfully");
    } catch (error) {
      console.log("WORKSPACE CREATE ERROR:", error);
    }
  }
);
//inngest function to update worspace data in. databaser
// Inngest function to update workspace data in database

const SyncWorkspaceUpdation = inngest.createFunction(
  {
    id: "update-workspace-from-clerk",
  },
  { event: "clerk/organization.updated" },

  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspace.update({
        where: {
          id: data.id,
        },
        data: {
          name: data.name,
          slug: data.slug,
          image_url: data.image_url ?? "",
        },
      });

      console.log("Workspace updated successfully");
    } catch (error) {
      console.log("WORKSPACE UPDATE ERROR:", error);
    }
  }
);

// Inngest function to delete workspace data from database

const SyncWorkspaceDeletion = inngest.createFunction(
  {
    id: "delete-workspace-from-clerk",
  },
  { event: "clerk/organization.deleted" },

  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspace.delete({
        where: {
          id: data.id,
        },
      });

      console.log("Workspace deleted successfully");
    } catch (error) {
      console.log("WORKSPACE DELETE ERROR:", error);
    }
  }
);
// Inngest function to save workspace member data to database

const SyncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "sync-workspace-member-from-clerk",
  },
  { event: "clerk/organizationMembership.created" },

  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspaceMember.create({
        data: {
          userId: data.user_id,
          workspaceId: data.organization.id,
          role:String(data.role_name).toUpperCase(),
          message: "Added from Clerk organization",
        },
      });

      console.log("Workspace member added successfully");
    } catch (error) {
      console.log("WORKSPACE MEMBER CREATE ERROR:", error);
    }
  }
);

/* export list */
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
   SyncWorkspaceUpdation,
    SyncWorkspaceDeletion,
     SyncWorkspaceMemberCreation,

];