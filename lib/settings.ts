import prisma from "@/lib/prisma";

export type PublicModuleSettings = {
  blogEnabled: boolean;
  projectsEnabled: boolean;
  shopEnabled: boolean;
};

export async function getAppSettings() {
  try {
    return await prisma.appSettings.upsert({
      where: {
        id: 1,
      },
      update: {},
      create: {
        id: 1,
      },
    });
  } catch (error) {
    const prismaCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;

    if (prismaCode === "P2021") {
      const now = new Date();

      return {
        id: 1,
        blogEnabled: true,
        projectsEnabled: true,
        shopEnabled: true,
        createdAt: now,
        updatedAt: now,
      };
    }

    throw error;
  }
}

export async function getPublicModuleSettings(): Promise<PublicModuleSettings> {
  const settings = await getAppSettings();

  return {
    blogEnabled: settings.blogEnabled,
    projectsEnabled: settings.projectsEnabled,
    shopEnabled: settings.shopEnabled,
  };
}

export function isModuleEnabled(
  settings: PublicModuleSettings,
  module: keyof PublicModuleSettings,
) {
  return settings[module];
}
