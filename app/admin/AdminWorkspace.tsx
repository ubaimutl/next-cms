"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { canManageAdminUsers, canManageSettings } from "@/lib/admin-permissions";
import { getPlainTextFromHtml } from "@/lib/post-content";

import DashboardSection from "./components/DashboardSection";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import MediaSection from "./components/MediaSection";
import MessagesSection from "./components/MessagesSection";
import OrdersSection from "./components/OrdersSection";
import PostComposer from "./components/PostComposer";
import PostsSection from "./components/PostsSection";
import ProductComposer from "./components/ProductComposer";
import ProjectComposer from "./components/ProjectComposer";
import ProjectsSection from "./components/ProjectsSection";
import SettingsSection from "./components/SettingsSection";
import ShopSection from "./components/ShopSection";
import {
  type AdminAppSettings,
  type AdminMediaAsset,
  type AdminMessage,
  type AdminMessageStatus,
  type AdminOrder,
  type AdminPost,
  type AdminProduct,
  type AdminProject,
  type AdminSection,
  type AdminUser,
  type AdminWorkspaceProps,
  type Feedback,
  type MessageFilter,
  type OrderFilter,
  type PostFilter,
  type ProductFormState,
  type ThemeMode,
  createEmptyAdminUserForm,
  createEmptyProductForm,
  createEmptyPostForm,
  createEmptyProjectForm,
} from "./components/types";

function parseInputList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

function applyTheme(theme: ThemeMode) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event("themechange"));
}

export default function AdminWorkspace({
  initialPosts,
  initialProjects,
  initialProducts,
  initialOrders,
  initialMessages,
  initialMediaAssets,
  initialAnalytics,
  initialSettings,
  initialUsers,
  admin,
}: AdminWorkspaceProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [projects, setProjects] = useState(initialProjects);
  const [products, setProducts] = useState(initialProducts);
  const [orders] = useState(initialOrders);
  const [messages, setMessages] = useState(initialMessages);
  const [mediaAssets, setMediaAssets] = useState(initialMediaAssets);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [settings, setSettings] = useState<AdminAppSettings>(initialSettings);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialUsers);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);
  const [isDeletingPostId, setIsDeletingPostId] = useState<number | null>(null);
  const [isDeletingProjectId, setIsDeletingProjectId] = useState<number | null>(
    null,
  );
  const [isDeletingProductId, setIsDeletingProductId] = useState<number | null>(
    null,
  );
  const [isDeletingMessageId, setIsDeletingMessageId] = useState<number | null>(
    null,
  );
  const [isDeletingMediaId, setIsDeletingMediaId] = useState<number | null>(null);
  const [isUpdatingAnalytics, setIsUpdatingAnalytics] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [isUpdatingUserId, setIsUpdatingUserId] = useState<number | null>(null);
  const [isDeletingUserId, setIsDeletingUserId] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [filter, setFilter] = useState<PostFilter>("all");
  const [messageFilter, setMessageFilter] = useState<MessageFilter>("all");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [editorKey, setEditorKey] = useState(0);
  const [postInputKey, setPostInputKey] = useState(0);
  const [projectInputKey, setProjectInputKey] = useState(0);
  const [productInputKey, setProductInputKey] = useState(0);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    initialMessages[0]?.id ?? null,
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    initialOrders[0]?.id ?? null,
  );
  const [postExistingImage, setPostExistingImage] = useState<string | null>(null);
  const [projectExistingImages, setProjectExistingImages] = useState<string[]>(
    [],
  );
  const [productExistingImages, setProductExistingImages] = useState<string[]>(
    [],
  );
  const [, startTransition] = useTransition();
  const [postForm, setPostForm] = useState(createEmptyPostForm);
  const [projectForm, setProjectForm] = useState(createEmptyProjectForm);
  const [productForm, setProductForm] = useState<ProductFormState>(
    createEmptyProductForm,
  );
  const [userForm, setUserForm] = useState(createEmptyAdminUserForm);
  const canManageWorkspaceSettings = canManageSettings(admin);
  const canManageWorkspaceUsers = canManageAdminUsers(admin);

  const publishedCount = useMemo(
    () => posts.filter((post) => post.published).length,
    [posts],
  );
  const draftCount = posts.length - publishedCount;
  const newMessageCount = useMemo(
    () => messages.filter((message) => message.status === "NEW").length,
    [messages],
  );
  const readMessageCount = useMemo(
    () => messages.filter((message) => message.status === "READ").length,
    [messages],
  );
  const archivedMessageCount = useMemo(
    () => messages.filter((message) => message.status === "ARCHIVED").length,
    [messages],
  );
  const pendingOrderCount = useMemo(
    () => orders.filter((order) => order.status === "PENDING").length,
    [orders],
  );
  const completedOrderCount = useMemo(
    () => orders.filter((order) => order.status === "COMPLETED").length,
    [orders],
  );
  const failedOrderCount = useMemo(
    () => orders.filter((order) => order.status === "FAILED").length,
    [orders],
  );
  const canceledOrderCount = useMemo(
    () => orders.filter((order) => order.status === "CANCELED").length,
    [orders],
  );

  const visiblePosts = useMemo(() => {
    if (filter === "published") {
      return posts.filter((post) => post.published);
    }

    if (filter === "draft") {
      return posts.filter((post) => !post.published);
    }

    return posts;
  }, [filter, posts]);

  const visibleMessages = useMemo(() => {
    if (messageFilter === "new") {
      return messages.filter((message) => message.status === "NEW");
    }

    if (messageFilter === "read") {
      return messages.filter((message) => message.status === "READ");
    }

    if (messageFilter === "archived") {
      return messages.filter((message) => message.status === "ARCHIVED");
    }

    return messages;
  }, [messageFilter, messages]);

  const visibleOrders = useMemo(() => {
    if (orderFilter === "pending") {
      return orders.filter((order) => order.status === "PENDING");
    }

    if (orderFilter === "completed") {
      return orders.filter((order) => order.status === "COMPLETED");
    }

    if (orderFilter === "failed") {
      return orders.filter((order) => order.status === "FAILED");
    }

    if (orderFilter === "canceled") {
      return orders.filter((order) => order.status === "CANCELED");
    }

    return orders;
  }, [orderFilter, orders]);

  const isEditingPost = editingPostId !== null;
  const isEditingProject = editingProjectId !== null;
  const isEditingProduct = editingProductId !== null;
  const selectedMessage =
    visibleMessages.find((message) => message.id === selectedMessageId) ??
    visibleMessages[0] ??
    null;
  const selectedOrder =
    visibleOrders.find((order) => order.id === selectedOrderId) ??
    visibleOrders[0] ??
    null;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!selectedMessage) {
      if (selectedMessageId !== null) {
        setSelectedMessageId(null);
      }

      return;
    }

    if (selectedMessage.id !== selectedMessageId) {
      setSelectedMessageId(selectedMessage.id);
    }
  }, [selectedMessage, selectedMessageId]);

  useEffect(() => {
    if (!selectedOrder) {
      if (selectedOrderId !== null) {
        setSelectedOrderId(null);
      }

      return;
    }

    if (selectedOrder.id !== selectedOrderId) {
      setSelectedOrderId(selectedOrder.id);
    }
  }, [selectedOrder, selectedOrderId]);

  function resetPostComposer() {
    setEditingPostId(null);
    setPostExistingImage(null);
    setPostForm(createEmptyPostForm());
    setEditorKey((current) => current + 1);
    setPostInputKey((current) => current + 1);
  }

  function resetProjectComposer() {
    setEditingProjectId(null);
    setProjectExistingImages([]);
    setProjectForm(createEmptyProjectForm());
    setProjectInputKey((current) => current + 1);
  }

  function resetProductComposer() {
    setEditingProductId(null);
    setProductExistingImages([]);
    setProductForm(createEmptyProductForm());
    setEditorKey((current) => current + 1);
    setProductInputKey((current) => current + 1);
  }

  function closeComposer() {
    if (activeSection === "posts") {
      resetPostComposer();
    }

    if (activeSection === "projects") {
      resetProjectComposer();
    }

    if (activeSection === "shop") {
      resetProductComposer();
    }

    setShowComposer(false);
    setFeedback(null);
  }

  function switchSection(section: AdminSection) {
    if (section === "settings" && !canManageWorkspaceSettings) {
      return;
    }

    setActiveSection(section);
    setShowComposer(false);
    setFeedback(null);
    resetPostComposer();
    resetProjectComposer();
    resetProductComposer();

    if (section === "messages" && !selectedMessageId && messages[0]) {
      setSelectedMessageId(messages[0].id);
    }

    if (section === "orders" && !selectedOrderId && orders[0]) {
      setSelectedOrderId(orders[0].id);
    }

    if (section === "media") {
      void refreshMediaAssets();
    }
  }

  function startPostCreate() {
    setActiveSection("posts");
    setFeedback(null);
    resetPostComposer();
    setShowComposer(true);
  }

  function startProjectCreate() {
    setActiveSection("projects");
    setFeedback(null);
    resetProjectComposer();
    setShowComposer(true);
  }

  function startProductCreate() {
    setActiveSection("shop");
    setFeedback(null);
    resetProductComposer();
    setShowComposer(true);
  }

  function startPostEdit(post: AdminPost) {
    setActiveSection("posts");
    setFeedback(null);
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      contentHtml: post.content ?? "",
      contentText: getPlainTextFromHtml(post.content ?? ""),
      featuredImageFile: null,
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoDescription ?? "",
      seoImage: post.seoImage ?? "",
      published: post.published,
    });
    setPostExistingImage(post.featuredImage);
    setEditorKey((current) => current + 1);
    setPostInputKey((current) => current + 1);
    setShowComposer(true);
  }

  function startProjectEdit(project: AdminProject) {
    setActiveSection("projects");
    setFeedback(null);
    setEditingProjectId(project.id);
    setProjectExistingImages(project.images);
    setProjectForm({
      title: project.title,
      description: project.description,
      tags: project.tags.join(", "),
      primaryImageFile: null,
      secondaryImageFile: null,
      link: project.link ?? "",
    });
    setProjectInputKey((current) => current + 1);
    setShowComposer(true);
  }

  function startProductEdit(product: AdminProduct) {
    setActiveSection("shop");
    setFeedback(null);
    setEditingProductId(product.id);
    setProductExistingImages(product.images);
    setProductForm({
      title: product.title,
      summary: product.summary,
      contentHtml: product.content ?? "",
      contentText: getPlainTextFromHtml(product.content ?? ""),
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      seoImage: product.seoImage ?? "",
      price: String(product.priceCents / 100),
      kind: product.kind,
      active: product.active,
      availability: product.availability,
      requiresBrief: product.requiresBrief,
      briefPrompt: product.briefPrompt ?? "",
      deliveryText: product.deliveryText ?? "",
      highlights: product.highlights.join(", "),
      primaryImageFile: null,
      secondaryImageFile: null,
    });
    setEditorKey((current) => current + 1);
    setProductInputKey((current) => current + 1);
    setShowComposer(true);
  }

  async function updateMessageStatus(
    messageId: number,
    status: AdminMessageStatus,
  ) {
    setIsUpdatingMessage(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as
        | AdminMessage
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to update message.",
        );
      }

      const updatedMessage = payload as AdminMessage;

      setMessages((current) =>
        current.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message,
        ),
      );
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Failed to update message.",
      });
    } finally {
      setIsUpdatingMessage(false);
    }
  }

  async function openMessage(message: AdminMessage) {
    setSelectedMessageId(message.id);

    if (message.status === "NEW") {
      await updateMessageStatus(message.id, "READ");
    }
  }

  async function uploadProjectImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/projects", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as
      | { url: string }
      | { error?: string };

    if (!response.ok || !("url" in payload)) {
      throw new Error(
        "error" in payload && payload.error
          ? payload.error
          : "Failed to upload image.",
      );
    }

    return payload.url;
  }

  async function uploadPostImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/posts", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as
      | { url: string }
      | { error?: string };

    if (!response.ok || !("url" in payload)) {
      throw new Error(
        "error" in payload && payload.error
          ? payload.error
          : "Failed to upload image.",
      );
    }

    return payload.url;
  }

  async function uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/products", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as
      | { url: string }
      | { error?: string };

    if (!response.ok || !("url" in payload)) {
      throw new Error(
        "error" in payload && payload.error
          ? payload.error
          : "Failed to upload image.",
      );
    }

    return payload.url;
  }

  async function refreshMediaAssets() {
    try {
      const response = await fetch("/api/media", {
        cache: "no-store",
      });
      const payload = (await response.json()) as
        | AdminMediaAsset[]
        | { error?: string };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(
          !Array.isArray(payload) && payload.error
            ? payload.error
            : "Failed to refresh media assets.",
        );
      }

      setMediaAssets(payload);
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to refresh media assets.",
      });
    }
  }

  function handleProjectFileChange(
    field: "primaryImageFile" | "secondaryImageFile",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setProjectForm((current) => ({
      ...current,
      [field]: file,
    }));
  }

  function handlePostFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setPostForm((current) => ({
      ...current,
      featuredImageFile: file,
    }));
  }

  function handleProductFileChange(
    field: "primaryImageFile" | "secondaryImageFile",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setProductForm((current) => ({
      ...current,
      [field]: file,
    }));
  }

  async function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!postForm.title.trim()) {
      setFeedback({
        tone: "error",
        text: "Title is required.",
      });
      return;
    }

    if (!postForm.contentText.trim()) {
      setFeedback({
        tone: "error",
        text: "Content is required.",
      });
      return;
    }

    setIsSubmittingPost(true);
    setFeedback(null);

    try {
      const featuredImage = postForm.featuredImageFile
        ? await uploadPostImage(postForm.featuredImageFile)
        : postExistingImage;
      const endpoint =
        editingPostId === null ? "/api/posts" : `/api/posts/${editingPostId}`;
      const method = editingPostId === null ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postForm.title,
          content: postForm.contentHtml,
          featuredImage,
          seoTitle: postForm.seoTitle,
          seoDescription: postForm.seoDescription,
          seoImage: postForm.seoImage,
          published: postForm.published,
        }),
      });

      const payload = (await response.json()) as
        | AdminPost
        | { error?: string; details?: unknown };

      if (!response.ok) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : editingPostId === null
              ? "Failed to create the post."
              : "Failed to update the post.";

        throw new Error(message);
      }

      const savedPost = payload as AdminPost;

      startTransition(() => {
        setPosts((current) =>
          editingPostId === null
            ? [savedPost, ...current]
            : current.map((post) =>
              post.id === savedPost.id ? savedPost : post,
            ),
        );
        setFeedback({
          tone: "success",
          text:
            editingPostId === null
              ? savedPost.published
                ? "Post published."
                : "Draft saved."
              : "Post updated.",
        });
        resetPostComposer();
        setShowComposer(false);
      });
      void refreshMediaAssets();
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : editingPostId === null
              ? "Failed to create the post."
              : "Failed to update the post.",
      });
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tags = parseInputList(projectForm.tags);

    if (!projectForm.title.trim()) {
      setFeedback({
        tone: "error",
        text: "Project title is required.",
      });
      return;
    }

    if (!projectForm.description.trim()) {
      setFeedback({
        tone: "error",
        text: "Project description is required.",
      });
      return;
    }

    if (tags.length === 0) {
      setFeedback({
        tone: "error",
        text: "At least one tag is required.",
      });
      return;
    }

    if (editingProjectId === null && !projectForm.primaryImageFile) {
      setFeedback({
        tone: "error",
        text: "Primary image is required.",
      });
      return;
    }

    setIsSubmittingProject(true);
    setFeedback(null);

    try {
      const nextImages = [...projectExistingImages];

      if (projectForm.primaryImageFile) {
        nextImages[0] = await uploadProjectImage(projectForm.primaryImageFile);
      }

      if (projectForm.secondaryImageFile) {
        nextImages[1] = await uploadProjectImage(
          projectForm.secondaryImageFile,
        );
      }

      const images = nextImages.filter((image): image is string =>
        Boolean(image && image.trim()),
      );

      if (images.length === 0) {
        throw new Error("At least one image is required.");
      }

      const endpoint =
        editingProjectId === null
          ? "/api/projects"
          : `/api/projects/${editingProjectId}`;
      const method = editingProjectId === null ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: projectForm.title,
          description: projectForm.description,
          tags,
          images,
          link: projectForm.link.trim(),
        }),
      });

      const payload = (await response.json()) as
        | AdminProject
        | { error?: string; details?: unknown };

      if (!response.ok) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : editingProjectId === null
              ? "Failed to create the project."
              : "Failed to update the project.";

        throw new Error(message);
      }

      const savedProject = payload as AdminProject;

      startTransition(() => {
        setProjects((current) =>
          editingProjectId === null
            ? [savedProject, ...current]
            : current.map((project) =>
              project.id === savedProject.id ? savedProject : project,
            ),
        );
        setFeedback({
          tone: "success",
          text:
            editingProjectId === null ? "Project saved." : "Project updated.",
        });
        resetProjectComposer();
        setShowComposer(false);
      });
      void refreshMediaAssets();
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : editingProjectId === null
              ? "Failed to create the project."
              : "Failed to update the project.",
      });
    } finally {
      setIsSubmittingProject(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const highlights = parseInputList(productForm.highlights);
    const priceValue = Number(productForm.price);
    const priceCents = Math.round(priceValue * 100);

    if (!productForm.title.trim()) {
      setFeedback({
        tone: "error",
        text: "Product title is required.",
      });
      return;
    }

    if (!productForm.summary.trim()) {
      setFeedback({
        tone: "error",
        text: "Summary is required.",
      });
      return;
    }

    if (!productForm.contentText.trim()) {
      setFeedback({
        tone: "error",
        text: "Content is required.",
      });
      return;
    }

    if (!Number.isFinite(priceValue) || priceCents <= 0) {
      setFeedback({
        tone: "error",
        text: "Enter a valid price.",
      });
      return;
    }

    if (highlights.length === 0) {
      setFeedback({
        tone: "error",
        text: "At least one highlight is required.",
      });
      return;
    }

    if (editingProductId === null && !productForm.primaryImageFile) {
      setFeedback({
        tone: "error",
        text: "Primary image is required.",
      });
      return;
    }

    setIsSubmittingProduct(true);
    setFeedback(null);

    try {
      const nextImages = [...productExistingImages];

      if (productForm.primaryImageFile) {
        nextImages[0] = await uploadProductImage(productForm.primaryImageFile);
      }

      if (productForm.secondaryImageFile) {
        nextImages[1] = await uploadProductImage(
          productForm.secondaryImageFile,
        );
      }

      const images = nextImages.filter((image): image is string =>
        Boolean(image && image.trim()),
      );

      if (images.length === 0) {
        throw new Error("At least one image is required.");
      }

      const endpoint =
        editingProductId === null
          ? "/api/products"
          : `/api/products/${editingProductId}`;
      const method = editingProductId === null ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: productForm.title,
          summary: productForm.summary,
          content: productForm.contentHtml,
          seoTitle: productForm.seoTitle,
          seoDescription: productForm.seoDescription,
          seoImage: productForm.seoImage,
          priceCents,
          kind: productForm.kind,
          active: productForm.active,
          availability: productForm.availability,
          requiresBrief: productForm.requiresBrief,
          briefPrompt: productForm.requiresBrief
            ? productForm.briefPrompt.trim()
            : "",
          deliveryText: productForm.deliveryText.trim(),
          highlights,
          images,
        }),
      });

      const payload = (await response.json()) as
        | AdminProduct
        | { error?: string; details?: unknown };

      if (!response.ok) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : editingProductId === null
              ? "Failed to create the product."
              : "Failed to update the product.";

        throw new Error(message);
      }

      const savedProduct = payload as AdminProduct;

      startTransition(() => {
        setProducts((current) =>
          editingProductId === null
            ? [savedProduct, ...current]
            : current.map((product) =>
              product.id === savedProduct.id ? savedProduct : product,
            ),
        );
        setFeedback({
          tone: "success",
          text:
            editingProductId === null ? "Product saved." : "Product updated.",
        });
        resetProductComposer();
        setShowComposer(false);
      });
      void refreshMediaAssets();
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : editingProductId === null
              ? "Failed to create the product."
              : "Failed to update the product.",
      });
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to logout.");
      }

      startTransition(() => {
        router.replace("/admin/login");
        router.refresh();
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text: error instanceof Error ? error.message : "Failed to logout.",
      });
      setIsLoggingOut(false);
    }
  }

  async function handleAnalyticsToggle(nextEnabled: boolean) {
    setIsUpdatingAnalytics(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/analytics", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: nextEnabled,
        }),
      });

      const payload = (await response.json()) as
        | { enabled: boolean }
        | { error?: string };

      if (!response.ok || !("enabled" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to update analytics.",
        );
      }

      setAnalytics((current) => ({
        ...current,
        enabled: payload.enabled,
      }));
      setFeedback({
        tone: "success",
        text: payload.enabled ? "Analytics enabled." : "Analytics disabled.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update analytics.",
      });
    } finally {
      setIsUpdatingAnalytics(false);
    }
  }

  async function handleSettingsUpdate(
    patch: Partial<
      Pick<AdminAppSettings, "blogEnabled" | "projectsEnabled" | "shopEnabled">
    >,
  ) {
    setIsSavingSettings(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      const payload = (await response.json()) as
        | AdminAppSettings
        | { error?: string };

      if (!response.ok || !("blogEnabled" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to update settings.",
        );
      }

      setSettings({
        id: payload.id,
        blogEnabled: payload.blogEnabled,
        projectsEnabled: payload.projectsEnabled,
        shopEnabled: payload.shopEnabled,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      });
      setFeedback({
        tone: "success",
        text: "Settings updated.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Failed to update settings.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleCreateAdminUser() {
    setIsSubmittingUser(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      });

      const payload = (await response.json()) as AdminUser | { error?: string };

      if (!response.ok || !("role" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to create admin user.",
        );
      }

      startTransition(() => {
        setAdminUsers((current) => [...current, payload].sort((a, b) => {
          if (a.role === b.role) {
            return a.id - b.id;
          }

          return ["OWNER", "ADMIN", "EDITOR"].indexOf(a.role) -
            ["OWNER", "ADMIN", "EDITOR"].indexOf(b.role);
        }));
        setUserForm(createEmptyAdminUserForm());
        setFeedback({
          tone: "success",
          text: "Admin user created.",
        });
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to create admin user.",
      });
    } finally {
      setIsSubmittingUser(false);
    }
  }

  async function handleUpdateAdminUser(
    userId: number,
    patch: Partial<Pick<AdminUser, "role" | "active">>,
  ) {
    setIsUpdatingUserId(userId);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin-users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      const payload = (await response.json()) as AdminUser | { error?: string };

      if (!response.ok || !("role" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to update admin user.",
        );
      }

      setAdminUsers((current) =>
        current
          .map((user) => (user.id === payload.id ? payload : user))
          .sort((a, b) => {
            if (a.role === b.role) {
              return a.id - b.id;
            }

            return ["OWNER", "ADMIN", "EDITOR"].indexOf(a.role) -
              ["OWNER", "ADMIN", "EDITOR"].indexOf(b.role);
          }),
      );
      setFeedback({
        tone: "success",
        text: "Admin user updated.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update admin user.",
      });
    } finally {
      setIsUpdatingUserId(null);
    }
  }

  async function handleDeleteAdminUser(user: AdminUser) {
    if (
      !window.confirm(
        `Delete ${user.name?.trim() || user.email}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeletingUserId(user.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin-users/${user.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { id: number } | { error?: string };

      if (!response.ok || !("id" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to delete admin user.",
        );
      }

      setAdminUsers((current) =>
        current.filter((entry) => entry.id !== user.id),
      );
      setFeedback({
        tone: "success",
        text: "Admin user deleted.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete admin user.",
      });
    } finally {
      setIsDeletingUserId(null);
    }
  }

  async function handleDeletePost(post: AdminPost) {
    if (
      !window.confirm(`Delete "${post.title}"? This action cannot be undone.`)
    ) {
      return;
    }

    setIsDeletingPostId(post.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as
        | { id: number }
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to delete the post.",
        );
      }

      startTransition(() => {
        setPosts((current) => current.filter((entry) => entry.id !== post.id));

        if (editingPostId === post.id) {
          resetPostComposer();
          setShowComposer(false);
        }

        setFeedback({
          tone: "success",
          text: "Post deleted.",
        });
      });
      void refreshMediaAssets();
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Failed to delete the post.",
      });
    } finally {
      setIsDeletingPostId(null);
    }
  }

  async function handleDeleteProject(project: AdminProject) {
    if (
      !window.confirm(`Delete "${project.title}"? This action cannot be undone.`)
    ) {
      return;
    }

    setIsDeletingProjectId(project.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as
        | { id: number }
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to delete the project.",
        );
      }

      startTransition(() => {
        setProjects((current) =>
          current.filter((entry) => entry.id !== project.id),
        );

        if (editingProjectId === project.id) {
          resetProjectComposer();
          setShowComposer(false);
        }

        setFeedback({
          tone: "success",
          text: "Project deleted.",
        });
      });
      void refreshMediaAssets();
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete the project.",
      });
    } finally {
      setIsDeletingProjectId(null);
    }
  }

  async function handleDeleteProduct(product: AdminProduct) {
    if (
      !window.confirm(`Delete "${product.title}"? This action cannot be undone.`)
    ) {
      return;
    }

    setIsDeletingProductId(product.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as
        | { id: number }
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to delete the product.",
        );
      }

      startTransition(() => {
        setProducts((current) =>
          current.filter((entry) => entry.id !== product.id),
        );

        if (editingProductId === product.id) {
          resetProductComposer();
          setShowComposer(false);
        }

        setFeedback({
          tone: "success",
          text: "Product deleted.",
        });
      });
      void refreshMediaAssets();
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete the product.",
      });
    } finally {
      setIsDeletingProductId(null);
    }
  }

  async function handleDeleteMessage(message: AdminMessage) {
    if (
      !window.confirm(
        `Delete the message from ${message.name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeletingMessageId(message.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/contact/${message.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as
        | { id: number }
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to delete the message.",
        );
      }

      startTransition(() => {
        setMessages((current) =>
          current.filter((entry) => entry.id !== message.id),
        );

        if (selectedMessageId === message.id) {
          setSelectedMessageId(null);
        }

        setFeedback({
          tone: "success",
          text: "Message deleted.",
        });
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete the message.",
      });
    } finally {
      setIsDeletingMessageId(null);
    }
  }

  async function handleDeleteMediaAsset(asset: AdminMediaAsset) {
    if (
      !window.confirm(
        `Delete "${asset.pathname}" from the media library? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeletingMediaId(asset.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/media/${asset.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as
        | { id: number }
        | { error?: string; usageCount?: number };

      if (!response.ok || !("id" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Failed to delete the media asset.",
        );
      }

      setMediaAssets((current) =>
        current.filter((entry) => entry.id !== asset.id),
      );
      setFeedback({
        tone: "success",
        text: "Media asset deleted.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete the media asset.",
      });
    } finally {
      setIsDeletingMediaId(null);
    }
  }

  function handleComposerButtonClick() {
    if (activeSection === "posts") {
      if (showComposer && !isEditingPost) {
        closeComposer();
      } else {
        startPostCreate();
      }
      return;
    }

    if (activeSection === "messages") {
      return;
    }

    if (activeSection === "orders") {
      return;
    }

    if (activeSection === "settings") {
      return;
    }

    if (activeSection === "media") {
      return;
    }

    if (activeSection === "shop") {
      if (showComposer && !isEditingProduct) {
        closeComposer();
      } else {
        startProductCreate();
      }
      return;
    }

    if (showComposer && !isEditingProject) {
      closeComposer();
    } else {
      startProjectCreate();
    }
  }

  const pageTitleBySection: Record<AdminSection, string> = {
    dashboard: "Dashboard",
    posts: "Posts",
    projects: "Projects",
    shop: "Shop",
    media: "Media",
    orders: "Orders",
    messages: "Messages",
    settings: "Settings",
  };
  const pageTitle = pageTitleBySection[activeSection];
  const isPostEditorMode = activeSection === "posts" && showComposer;

  if (isPostEditorMode) {
    return (
      <section className="next-cms-admin admin-shell" data-admin-theme={theme}>
        {feedback ? (
          <div className="pointer-events-none fixed top-4 left-1/2 z-[140] -translate-x-1/2 px-4">
            <div
              className={`rounded-md border px-4 py-3 text-sm leading-relaxed shadow-[0_16px_40px_rgba(0,0,0,0.24)] ${feedback.tone === "success"
                  ? "border-emerald-500/20 bg-emerald-500/12 text-emerald-200"
                  : "border-red-500/20 bg-red-500/12 text-red-200"
                }`}
            >
              {feedback.text}
            </div>
          </div>
        ) : null}

        <PostComposer
          isEditingPost={isEditingPost}
          postForm={postForm}
          editorKey={editorKey}
          postInputKey={postInputKey}
          featuredImageUrl={postExistingImage}
          isSubmittingPost={isSubmittingPost}
          onSubmit={handlePostSubmit}
          onCancel={closeComposer}
          onTitleChange={(title) =>
            setPostForm((current) => ({
              ...current,
              title,
            }))
          }
          onSeoTitleChange={(seoTitle) =>
            setPostForm((current) => ({
              ...current,
              seoTitle,
            }))
          }
          onSeoDescriptionChange={(seoDescription) =>
            setPostForm((current) => ({
              ...current,
              seoDescription,
            }))
          }
          onSeoImageChange={(seoImage) =>
            setPostForm((current) => ({
              ...current,
              seoImage,
            }))
          }
          onPublishedToggle={() =>
            setPostForm((current) => ({
              ...current,
              published: !current.published,
            }))
          }
          onFeaturedImageChange={handlePostFileChange}
          onRemoveFeaturedImage={() => {
            setPostExistingImage(null);
            setPostForm((current) => ({
              ...current,
              featuredImageFile: null,
            }));
            setPostInputKey((current) => current + 1);
          }}
          onContentChange={({ html, text }) =>
            setPostForm((current) => ({
              ...current,
              contentHtml: html,
              contentText: text,
            }))
          }
        />
      </section>
    );
  }

  return (
    <section
      className="next-cms-admin admin-shell [font-family:-apple-system,BlinkMacSystemFont,Segoe_UI,Roboto,Oxygen,Ubuntu,Droid_Sans,Helvetica_Neue,sans-serif]"
      data-admin-theme={theme}
    >
      <div className="grid min-h-screen xl:grid-cols-[18.5rem_minmax(0,1fr)]">
        <AdminSidebar
          admin={admin}
          theme={theme}
          isLoggingOut={isLoggingOut}
          activeSection={activeSection}
          postCount={posts.length}
          projectCount={projects.length}
          productCount={products.length}
          mediaCount={mediaAssets.length}
          orderCount={orders.length}
          messageCount={messages.length}
          userCount={adminUsers.length}
          filter={filter}
          draftCount={draftCount}
          publishedCount={publishedCount}
          orderFilter={orderFilter}
          pendingOrderCount={pendingOrderCount}
          completedOrderCount={completedOrderCount}
          failedOrderCount={failedOrderCount}
          canceledOrderCount={canceledOrderCount}
          messageFilter={messageFilter}
          newMessageCount={newMessageCount}
          readMessageCount={readMessageCount}
          archivedMessageCount={archivedMessageCount}
          canManageSettings={canManageWorkspaceSettings}
          onLogout={() => {
            void handleLogout();
          }}
          onToggleTheme={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
          onSwitchSection={switchSection}
          onSetFilter={setFilter}
          onSetOrderFilter={setOrderFilter}
          onSetMessageFilter={setMessageFilter}
        />

        <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
          <AdminHeader
            activeSection={activeSection}
            pageTitle={pageTitle}
            filter={filter}
            messageFilter={messageFilter}
            orderFilter={orderFilter}
            analyticsEnabled={analytics.enabled}
            canManageSettings={canManageWorkspaceSettings}
            projectCount={projects.length}
            productCount={products.length}
            mediaCount={mediaAssets.length}
            orderCount={orders.length}
            pendingOrderCount={pendingOrderCount}
            completedOrderCount={completedOrderCount}
            failedOrderCount={failedOrderCount}
            canceledOrderCount={canceledOrderCount}
            showComposer={showComposer}
            isEditingPost={isEditingPost}
            isEditingProject={isEditingProject}
            isEditingProduct={isEditingProduct}
            onSetFilter={setFilter}
            onSetMessageFilter={setMessageFilter}
            onSetOrderFilter={setOrderFilter}
            onComposerButtonClick={handleComposerButtonClick}
          />

          {feedback ? (
            <div
              className={`admin-panel px-6 py-4 text-sm leading-relaxed md:px-8 ${feedback.tone === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/20 bg-red-500/10 text-red-200"
                }`}
            >
              {feedback.text}
            </div>
          ) : null}

          {showComposer &&
            (activeSection === "posts" ? (
              <PostComposer
                isEditingPost={isEditingPost}
                postForm={postForm}
                editorKey={editorKey}
                postInputKey={postInputKey}
                featuredImageUrl={postExistingImage}
                isSubmittingPost={isSubmittingPost}
                onSubmit={handlePostSubmit}
                onCancel={closeComposer}
                onTitleChange={(title) =>
                  setPostForm((current) => ({
                    ...current,
                    title,
                  }))
                }
                onSeoTitleChange={(seoTitle) =>
                  setPostForm((current) => ({
                    ...current,
                    seoTitle,
                  }))
                }
                onSeoDescriptionChange={(seoDescription) =>
                  setPostForm((current) => ({
                    ...current,
                    seoDescription,
                  }))
                }
                onSeoImageChange={(seoImage) =>
                  setPostForm((current) => ({
                    ...current,
                    seoImage,
                  }))
                }
                onPublishedToggle={() =>
                  setPostForm((current) => ({
                    ...current,
                    published: !current.published,
                  }))
                }
                onFeaturedImageChange={handlePostFileChange}
                onRemoveFeaturedImage={() => {
                  setPostExistingImage(null);
                  setPostForm((current) => ({
                    ...current,
                    featuredImageFile: null,
                  }));
                  setPostInputKey((current) => current + 1);
                }}
                onContentChange={({ html, text }) =>
                  setPostForm((current) => ({
                    ...current,
                    contentHtml: html,
                    contentText: text,
                  }))
                }
              />
            ) : activeSection === "projects" ? (
              <ProjectComposer
                isEditingProject={isEditingProject}
                projectForm={projectForm}
                projectExistingImages={projectExistingImages}
                projectInputKey={projectInputKey}
                isSubmittingProject={isSubmittingProject}
                onSubmit={handleProjectSubmit}
                onCancel={closeComposer}
                onTitleChange={(title) =>
                  setProjectForm((current) => ({
                    ...current,
                    title,
                  }))
                }
                onLinkChange={(link) =>
                  setProjectForm((current) => ({
                    ...current,
                    link,
                  }))
                }
                onDescriptionChange={(description) =>
                  setProjectForm((current) => ({
                    ...current,
                    description,
                  }))
                }
                onTagsChange={(tags) =>
                  setProjectForm((current) => ({
                    ...current,
                    tags,
                  }))
                }
                onPrimaryImageChange={(event) =>
                  handleProjectFileChange("primaryImageFile", event)
                }
                onSecondaryImageChange={(event) =>
                  handleProjectFileChange("secondaryImageFile", event)
                }
              />
            ) : activeSection === "shop" ? (
              <ProductComposer
                isEditingProduct={isEditingProduct}
                productForm={productForm}
                productExistingImages={productExistingImages}
                productInputKey={productInputKey}
                editorKey={editorKey}
                isSubmittingProduct={isSubmittingProduct}
                onSubmit={handleProductSubmit}
                onCancel={closeComposer}
                onTitleChange={(title) =>
                  setProductForm((current) => ({
                    ...current,
                    title,
                  }))
                }
                onSummaryChange={(summary) =>
                  setProductForm((current) => ({
                    ...current,
                    summary,
                  }))
                }
                onSeoTitleChange={(seoTitle) =>
                  setProductForm((current) => ({
                    ...current,
                    seoTitle,
                  }))
                }
                onSeoDescriptionChange={(seoDescription) =>
                  setProductForm((current) => ({
                    ...current,
                    seoDescription,
                  }))
                }
                onSeoImageChange={(seoImage) =>
                  setProductForm((current) => ({
                    ...current,
                    seoImage,
                  }))
                }
                onPriceChange={(price) =>
                  setProductForm((current) => ({
                    ...current,
                    price,
                  }))
                }
                onKindChange={(kind) =>
                  setProductForm((current) => ({
                    ...current,
                    kind,
                  }))
                }
                onActiveToggle={() =>
                  setProductForm((current) => ({
                    ...current,
                    active: !current.active,
                  }))
                }
                onAvailabilityChange={(availability) =>
                  setProductForm((current) => ({
                    ...current,
                    availability,
                  }))
                }
                onRequiresBriefToggle={() =>
                  setProductForm((current) => ({
                    ...current,
                    requiresBrief: !current.requiresBrief,
                    briefPrompt: current.requiresBrief ? "" : current.briefPrompt,
                  }))
                }
                onBriefPromptChange={(briefPrompt) =>
                  setProductForm((current) => ({
                    ...current,
                    briefPrompt,
                  }))
                }
                onDeliveryTextChange={(deliveryText) =>
                  setProductForm((current) => ({
                    ...current,
                    deliveryText,
                  }))
                }
                onHighlightsChange={(highlights) =>
                  setProductForm((current) => ({
                    ...current,
                    highlights,
                  }))
                }
                onPrimaryImageChange={(event) =>
                  handleProductFileChange("primaryImageFile", event)
                }
                onSecondaryImageChange={(event) =>
                  handleProductFileChange("secondaryImageFile", event)
                }
                onContentChange={({ html, text }) =>
                  setProductForm((current) => ({
                    ...current,
                    contentHtml: html,
                    contentText: text,
                  }))
                }
              />
            ) : null)}

          <div>
            {activeSection === "dashboard" ? (
              <DashboardSection
                analytics={analytics}
                posts={posts}
                projects={projects}
                products={products}
                orders={orders}
                messages={messages}
                onOpenPosts={() => switchSection("posts")}
                onNewPost={startPostCreate}
                onOpenMessages={() => switchSection("messages")}
                onOpenOrders={() => switchSection("orders")}
                onOpenShop={() => switchSection("shop")}
                onOpenProjects={() => switchSection("projects")}
              />
            ) : activeSection === "posts" ? (
              <PostsSection
                posts={visiblePosts}
                postViewCounts={analytics.postViewCounts}
                isDeletingPostId={isDeletingPostId}
                onEdit={startPostEdit}
                onDelete={(post) => {
                  void handleDeletePost(post);
                }}
              />
            ) : activeSection === "projects" ? (
              <ProjectsSection
                projects={projects}
                isDeletingProjectId={isDeletingProjectId}
                onEdit={startProjectEdit}
                onDelete={(project) => {
                  void handleDeleteProject(project);
                }}
              />
            ) : activeSection === "shop" ? (
              <ShopSection
                products={products}
                isDeletingProductId={isDeletingProductId}
                onEdit={startProductEdit}
                onDelete={(product) => {
                  void handleDeleteProduct(product);
                }}
              />
            ) : activeSection === "media" ? (
              <MediaSection
                assets={mediaAssets}
                isDeletingMediaId={isDeletingMediaId}
                onDelete={(asset) => {
                  void handleDeleteMediaAsset(asset);
                }}
              />
            ) : activeSection === "orders" ? (
              <OrdersSection
                orders={visibleOrders}
                selectedOrder={selectedOrder}
                onOpenOrder={(order: AdminOrder) => {
                  setSelectedOrderId(order.id);
                }}
              />
            ) : activeSection === "messages" ? (
              <MessagesSection
                messages={visibleMessages}
                selectedMessage={selectedMessage}
                isUpdatingMessage={isUpdatingMessage}
                isDeletingMessageId={isDeletingMessageId}
                onOpenMessage={(message) => {
                  void openMessage(message);
                }}
                onUpdateMessageStatus={(messageId, status) => {
                  void updateMessageStatus(messageId, status);
                }}
                onDeleteMessage={(message) => {
                  void handleDeleteMessage(message);
                }}
              />
            ) : (
              <SettingsSection
                settings={settings}
                analytics={analytics}
                adminUsers={adminUsers}
                currentAdmin={{ id: admin.id, role: admin.role }}
                canManageSettings={canManageWorkspaceSettings}
                canManageUsers={canManageWorkspaceUsers}
                isSavingSettings={isSavingSettings}
                isUpdatingAnalytics={isUpdatingAnalytics}
                isSubmittingUser={isSubmittingUser}
                isUpdatingUserId={isUpdatingUserId}
                isDeletingUserId={isDeletingUserId}
                userForm={userForm}
                onToggleModule={(module, nextValue) => {
                  void handleSettingsUpdate({ [module]: nextValue });
                }}
                onToggleAnalytics={(nextEnabled) => {
                  void handleAnalyticsToggle(nextEnabled);
                }}
                onUserFormChange={(field, value) =>
                  setUserForm((current) => ({
                    ...current,
                    [field]: value,
                  }))
                }
                onCreateUser={() => {
                  void handleCreateAdminUser();
                }}
                onUpdateUserRole={(user, role) => {
                  void handleUpdateAdminUser(user.id, { role });
                }}
                onToggleUserActive={(user, nextActive) => {
                  void handleUpdateAdminUser(user.id, { active: nextActive });
                }}
                onDeleteUser={(user) => {
                  void handleDeleteAdminUser(user);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
