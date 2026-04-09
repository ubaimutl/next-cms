export type AdminPost = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  featuredImage: string | null;
  published: boolean;
  authorId: number;
};

export type ThemeMode = "light" | "dark";
export type AdminUserRole = "OWNER" | "ADMIN" | "EDITOR";

export type AdminProject = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  link: string | null;
};

export type AdminProductKind = "SERVICE" | "DIGITAL";
export type AdminProductAvailability = "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";
export type AdminMediaProvider = "BLOB" | "LOCAL";
export type AdminMediaKind = "POST_IMAGE" | "PROJECT_IMAGE" | "PRODUCT_IMAGE";

export type AdminProduct = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string | null;
  priceCents: number;
  currency: string;
  kind: AdminProductKind;
  active: boolean;
  availability: AdminProductAvailability;
  requiresBrief: boolean;
  briefPrompt: string | null;
  deliveryText: string | null;
  highlights: string[];
  images: string[];
};

export type AdminMediaAsset = {
  id: number;
  url: string;
  pathname: string;
  provider: AdminMediaProvider;
  kind: AdminMediaKind;
  mimeType: string;
  size: number;
  usageCount: number;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  createdAt: string;
};

export type AdminOrderStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELED";

export type AdminOrder = {
  id: number;
  productId: number;
  productTitle: string;
  productSlug: string | null;
  status: AdminOrderStatus;
  paypalOrderId: string;
  paypalCaptureId: string | null;
  amountCents: number;
  currency: string;
  buyerEmail: string | null;
  buyerName: string | null;
  buyerBrief: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminMessageStatus = "NEW" | "READ" | "ARCHIVED";

export type AdminMessage = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  website: string | null;
  services: string[];
  budget: string | null;
  timeline: string | null;
  message: string;
  status: AdminMessageStatus;
  emailSentAt: string | null;
  emailError: string | null;
  readAt: string | null;
  createdAt: string;
};

export type AdminAccount = {
  id: number;
  email: string;
  name: string | null;
  role: AdminUserRole;
  active: boolean;
};

export type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  role: AdminUserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminAppSettings = {
  id: number;
  blogEnabled: boolean;
  projectsEnabled: boolean;
  shopEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminAnalyticsTopPage = {
  path: string;
  views: number;
};

export type AdminAnalyticsTopPost = {
  slug: string;
  title: string;
  views: number;
};

export type AdminAnalyticsOverview = {
  enabled: boolean;
  totalPageViews: number;
  totalVisits: number;
  postPageViews: number;
  pageViewsLast7Days: number;
  visitsLast7Days: number;
  topPages: AdminAnalyticsTopPage[];
  topPosts: AdminAnalyticsTopPost[];
  postViewCounts: Record<string, number>;
};

export type AdminWorkspaceProps = {
  initialPosts: AdminPost[];
  initialProjects: AdminProject[];
  initialProducts: AdminProduct[];
  initialOrders: AdminOrder[];
  initialMessages: AdminMessage[];
  initialMediaAssets: AdminMediaAsset[];
  initialAnalytics: AdminAnalyticsOverview;
  initialSettings: AdminAppSettings;
  initialUsers: AdminUser[];
  admin: AdminAccount;
};

export type Feedback =
  | { tone: "success"; text: string }
  | { tone: "error"; text: string }
  | null;

export type PostFilter = "all" | "published" | "draft";
export type MessageFilter = "all" | "new" | "read" | "archived";
export type OrderFilter = "all" | "pending" | "completed" | "failed" | "canceled";
export type AdminSection =
  | "dashboard"
  | "posts"
  | "projects"
  | "shop"
  | "media"
  | "orders"
  | "messages"
  | "settings";

export type PostFormState = {
  title: string;
  contentHtml: string;
  contentText: string;
  featuredImageFile: File | null;
  published: boolean;
};

export type ProjectFormState = {
  title: string;
  description: string;
  tags: string;
  primaryImageFile: File | null;
  secondaryImageFile: File | null;
  link: string;
};

export type ProductFormState = {
  title: string;
  summary: string;
  contentHtml: string;
  contentText: string;
  price: string;
  kind: AdminProductKind;
  active: boolean;
  availability: AdminProductAvailability;
  requiresBrief: boolean;
  briefPrompt: string;
  deliveryText: string;
  highlights: string;
  primaryImageFile: File | null;
  secondaryImageFile: File | null;
};

export type AdminUserFormState = {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
  active: boolean;
};

export function createEmptyPostForm(): PostFormState {
  return {
    title: "",
    contentHtml: "",
    contentText: "",
    featuredImageFile: null,
    published: false,
  };
}

export function createEmptyProjectForm(): ProjectFormState {
  return {
    title: "",
    description: "",
    tags: "",
    primaryImageFile: null,
    secondaryImageFile: null,
    link: "",
  };
}

export function createEmptyProductForm(): ProductFormState {
  return {
    title: "",
    summary: "",
    contentHtml: "",
    contentText: "",
    price: "",
    kind: "SERVICE",
    active: true,
    availability: "AVAILABLE",
    requiresBrief: false,
    briefPrompt: "",
    deliveryText: "",
    highlights: "",
    primaryImageFile: null,
    secondaryImageFile: null,
  };
}

export function createEmptyAdminUserForm(): AdminUserFormState {
  return {
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    active: true,
  };
}
