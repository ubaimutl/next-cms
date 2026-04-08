import prisma from "@/lib/prisma";

export type PublicModuleSettings = {
  blogEnabled: boolean;
  projectsEnabled: boolean;
  shopEnabled: boolean;
};

function isPrismaErrorWithCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code === code
  );
}

async function createDefaultAppSettings() {
  try {
    return await prisma.appSettings.create({
      data: {
        id: 1,
      },
    });
  } catch (error) {
    if (!isPrismaErrorWithCode(error, "P2002")) {
      throw error;
    }

    const existingSettings = await prisma.appSettings.findUnique({
      where: {
        id: 1,
      },
    });

    if (existingSettings) {
      return existingSettings;
    }

    throw error;
  }
}

export async function getAppSettings() {
  try {
    const existingSettings = await prisma.appSettings.findUnique({
      where: {
        id: 1,
      },
    });

    if (existingSettings) {
      return existingSettings;
    }

    return await createDefaultAppSettings();
  } catch (error) {
    if (isPrismaErrorWithCode(error, "P2021")) {
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
