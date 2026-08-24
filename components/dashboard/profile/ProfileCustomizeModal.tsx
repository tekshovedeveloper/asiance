"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  AtSign,
  ArrowLeft,
  ArrowRight,
  Baby,
  BadgePercent,
  BookOpen,
  Camera,
  Check,
  Gem,
  Globe,
  Heart,
  HeartPulse,
  Home,
  ImageIcon,
  Link,
  Lock,
  Mail,
  MapPin,
  Newspaper,
  Plane,
  ShoppingBag,
  Smile,
  Sparkles,
  Tag,
  Utensils,
  User,
  Users,
  X,
} from "lucide-react";
import { getGroups, joinGroup, updateMe, uploadImage } from "@/lib/api";
import type { Group } from "@/lib/types";
import styles from "../dashboard.module.css";
import type { DashboardUser, ProfileVisibility } from "../types";

const STEP_COUNT = 5;
const BIO_LIMIT = 250;
const MAX_CATEGORY_SELECTIONS = 3;
const FALLBACK_COVER = "https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dummy-cover-png.png";
const FALLBACK_AVATAR = "https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dummy-profile-png.png";

type WizardStep = 1 | 2 | 3 | 4 | 5;
type UploadTarget = "avatar" | "cover";
type SocialKey = "facebookUrl" | "instagramUrl" | "tiktokUrl" | "snapchatUrl" | "emailLink";
type ListKey = "profileTags" | "hobbies" | "interests";
type CategoryKey = "blogCategoryInterests" | "productCategoryInterests";

type CustomizeProfileForm = {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  coverImageUrl: string;
  bio: string;
  address: string;
  profileVisibility: ProfileVisibility;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  snapchatUrl: string;
  emailLink: string;
  profileTags: string;
  hobbies: string;
  maritalStatus: string;
  interests: string;
  personalQuestion: string;
  blogCategoryInterests: string[];
  blogCategoryReason: string;
  productCategoryInterests: string[];
  productCategoryReason: string;
  communityCircleSlugs: string[];
};

const visibilityOptions: Array<{
  value: ProfileVisibility;
  label: string;
  copy: string;
  icon: ReactNode;
}> = [
  {
    value: "public",
    label: "Public",
    copy: "Anyone can see",
    icon: <Globe size={22} strokeWidth={1.8} />,
  },
  {
    value: "members",
    label: "Members",
    copy: "Asiance members",
    icon: <Users size={22} strokeWidth={1.8} />,
  },
  {
    value: "private",
    label: "Private",
    copy: "Only you",
    icon: <Lock size={22} strokeWidth={1.8} />,
  },
];

const socialFields: Array<{ key: SocialKey; label: string; placeholder: string }> = [
  { key: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/your-profile" },
  { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/your-profile" },
  { key: "tiktokUrl", label: "TikTok", placeholder: "https://tiktok.com/@your-profile" },
  { key: "snapchatUrl", label: "Snapchat", placeholder: "https://snapchat.com/add/your-profile" },
  { key: "emailLink", label: "Email link", placeholder: "hello@example.com" },
];

const listFields: Array<{ key: ListKey; label: string; placeholder: string }> = [
  { key: "profileTags", label: "Tags", placeholder: "Wellness, Fashion, Beauty" },
  { key: "hobbies", label: "Hobbies", placeholder: "Reading, Travel, Cooking" },
  { key: "interests", label: "Interests", placeholder: "Self-care, Community, Style" },
];

const maritalOptions = ["Single", "Married", "In a relationship", "Divorced", "Widowed", "Prefer not to say"];

const blogCategoryOptions: Array<{ label: string; icon: ReactNode }> = [
  { label: "Wedding", icon: <Heart size={22} strokeWidth={1.7} /> },
  { label: "Women", icon: <Sparkles size={22} strokeWidth={1.7} /> },
  { label: "Baby & Kids", icon: <Baby size={22} strokeWidth={1.7} /> },
  { label: "Travel", icon: <Plane size={22} strokeWidth={1.7} /> },
  { label: "Beauty", icon: <Smile size={22} strokeWidth={1.7} /> },
  { label: "Wellness", icon: <HeartPulse size={22} strokeWidth={1.7} /> },
  { label: "Fashion", icon: <ShoppingBag size={22} strokeWidth={1.7} /> },
  { label: "Community News", icon: <Newspaper size={22} strokeWidth={1.7} /> },
  { label: "Culture", icon: <BookOpen size={22} strokeWidth={1.7} /> },
];

const productCategoryOptions: Array<{ label: string; icon: ReactNode }> = [
  { label: "Beauty", icon: <Smile size={22} strokeWidth={1.7} /> },
  { label: "Fashion", icon: <ShoppingBag size={22} strokeWidth={1.7} /> },
  { label: "Jewelry", icon: <Gem size={22} strokeWidth={1.7} /> },
  { label: "Wedding", icon: <Heart size={22} strokeWidth={1.7} /> },
  { label: "Baby & Kids", icon: <Baby size={22} strokeWidth={1.7} /> },
  { label: "Home", icon: <Home size={22} strokeWidth={1.7} /> },
  { label: "Travel", icon: <Plane size={22} strokeWidth={1.7} /> },
  { label: "Food", icon: <Utensils size={22} strokeWidth={1.7} /> },
  { label: "Sale", icon: <BadgePercent size={22} strokeWidth={1.7} /> },
];

function listText(value?: string[] | null) {
  return (value ?? []).join(", ");
}

function parseList(value: string, limit = 8) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeVisibility(value?: ProfileVisibility | null): ProfileVisibility {
  if (value === "members" || value === "private") return value;
  return "public";
}

function formFromUser(user: DashboardUser): CustomizeProfileForm {
  return {
    name: user.name ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    avatarUrl: user.avatarUrl ?? "",
    coverImageUrl: user.coverImageUrl ?? "",
    bio: (user.bio ?? "").slice(0, BIO_LIMIT),
    address: user.address ?? "",
    profileVisibility: normalizeVisibility(user.profileVisibility),
    facebookUrl: user.facebookUrl ?? "",
    instagramUrl: user.instagramUrl ?? "",
    tiktokUrl: user.tiktokUrl ?? "",
    snapchatUrl: user.snapchatUrl ?? "",
    emailLink: user.emailLink ?? "",
    profileTags: listText(user.profileTags?.length ? user.profileTags : user.interests),
    hobbies: listText(user.hobbies),
    maritalStatus: user.maritalStatus ?? "",
    interests: listText(user.interests),
    personalQuestion: user.personalQuestion ?? "",
    blogCategoryInterests: user.blogCategoryInterests ?? [],
    blogCategoryReason: user.blogCategoryReason ?? "",
    productCategoryInterests: user.productCategoryInterests ?? [],
    productCategoryReason: user.productCategoryReason ?? "",
    communityCircleSlugs: user.communityCircleSlugs ?? [],
  };
}

export function ProfileCustomizeModal({
  open,
  user,
  onClose,
  onUserChange,
}: {
  open: boolean;
  user: DashboardUser;
  onClose: () => void;
  onUserChange: (u: DashboardUser) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<CustomizeProfileForm>(() => formFromUser(user));
  const [busy, setBusy] = useState<UploadTarget | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setForm(formFromUser(user));
    setError(null);
  }, [open, user]);

  useEffect(() => {
    if (!open) return;

    let isActive = true;
    setGroupsLoading(true);
    setGroupsError(null);

    getGroups()
      .then((items) => {
        if (!isActive) return;
        setGroups(items.filter((item) => item.slug).slice(0, 9));
      })
      .catch((err: any) => {
        if (!isActive) return;
        setGroupsError(err?.message ?? "Could not load circles.");
      })
      .finally(() => {
        if (isActive) setGroupsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  function updateField<Key extends keyof CustomizeProfileForm>(
    key: Key,
    value: CustomizeProfileForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCategory(key: CategoryKey, value: string) {
    setForm((current) => {
      const selected = current[key];
      const isSelected = selected.includes(value);

      if (isSelected) {
        return { ...current, [key]: selected.filter((item) => item !== value) };
      }

      if (selected.length >= MAX_CATEGORY_SELECTIONS) {
        return current;
      }

      return { ...current, [key]: [...selected, value] };
    });
  }

  function toggleCommunityCircle(slug: string) {
    setForm((current) => {
      const selected = current.communityCircleSlugs;
      const isSelected = selected.includes(slug);

      return {
        ...current,
        communityCircleSlugs: isSelected
          ? selected.filter((item) => item !== slug)
          : [...selected, slug],
      };
    });
  }

  function goNext() {
    setError(null);
    setStep((current) => (current < STEP_COUNT ? ((current + 1) as WizardStep) : current));
  }

  function goBack() {
    setError(null);
    setStep((current) => (current > 1 ? ((current - 1) as WizardStep) : current));
  }

  async function pickAndUpload(kind: UploadTarget, file: File) {
    setError(null);
    setBusy(kind);

    try {
      const uploaded = await uploadImage(file);
      updateField(kind === "avatar" ? "avatarUrl" : "coverImageUrl", uploaded.url);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
    } finally {
      setBusy(null);
    }
  }

  function handleImageChange(kind: UploadTarget, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void pickAndUpload(kind, file);
    event.currentTarget.value = "";
  }

  async function saveAndClose() {
    setBusy("save");
    setError(null);

    try {
      const username = form.username.trim();
      const email = form.email.trim();
      const communityCircleSlugs = form.communityCircleSlugs
        .map((slug) => slug.trim())
        .filter(Boolean);
      const updated = await updateMe({
        name: form.name.trim(),
        ...(username ? { username } : {}),
        ...(email ? { email } : {}),
        bio: form.bio.slice(0, BIO_LIMIT),
        avatarUrl: form.avatarUrl,
        coverImageUrl: form.coverImageUrl,
        address: form.address.trim(),
        profileVisibility: form.profileVisibility,
        facebookUrl: form.facebookUrl.trim(),
        instagramUrl: form.instagramUrl.trim(),
        tiktokUrl: form.tiktokUrl.trim(),
        snapchatUrl: form.snapchatUrl.trim(),
        emailLink: form.emailLink.trim(),
        profileTags: parseList(form.profileTags),
        hobbies: parseList(form.hobbies),
        maritalStatus: form.maritalStatus.trim(),
        interests: parseList(form.interests, 6),
        personalQuestion: form.personalQuestion.trim(),
        blogCategoryInterests: form.blogCategoryInterests,
        blogCategoryReason: form.blogCategoryReason.trim(),
        productCategoryInterests: form.productCategoryInterests,
        productCategoryReason: form.productCategoryReason.trim(),
        communityCircleSlugs,
      });

      const joined = await Promise.allSettled(
        communityCircleSlugs.map((slug) => joinGroup(slug)),
      );
      const failedJoinCount = joined.filter((result) => result.status === "rejected").length;
      onUserChange(updated);

      if (failedJoinCount) {
        throw new Error("Profile saved, but some circles could not be joined. Please try again.");
      }

      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Could not save profile.");
    } finally {
      setBusy(null);
    }
  }

  if (!open) return null;

  const avatarUrl = form.avatarUrl.trim() || FALLBACK_AVATAR;
  const coverUrl = form.coverImageUrl.trim() || FALLBACK_COVER;
  const bioCount = form.bio.length;

  return (
    <div
      className={styles.profileWizardBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.profileWizardPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-wizard-title"
      >
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => handleImageChange("avatar", event)}
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => handleImageChange("cover", event)}
        />

        <button
          type="button"
          className={styles.profileWizardClose}
          aria-label="Close profile customization"
          onClick={onClose}
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        <header className={styles.profileWizardHeader}>
          <div className={styles.profileWizardBrand}>
            <span className={styles.profileWizardLogo}>asiance</span>
          </div>

          <div className={styles.profileWizardProgress} aria-label={`Step ${step} of ${STEP_COUNT}`}>
            <span>Step {step} of {STEP_COUNT}</span>
            <div className={styles.profileWizardProgressBars}>
              {Array.from({ length: STEP_COUNT }, (_, index) => (
                <span
                  key={index}
                  className={index < step ? styles.profileWizardProgressActive : undefined}
                />
              ))}
            </div>
          </div>
        </header>

        <div className={styles.profileWizardBody}>
          {step === 1 ? (
            <>
              <div className={styles.profileWizardIntroRow}>
                <div>
                  <h2 id="profile-wizard-title" className={styles.profileWizardTitle}>
                    Let's start with you.
                  </h2>
                  <p className={styles.profileWizardCopy}>
                    Add the basic details people will see on your Asiance profile.
                  </p>
                </div>

                <div className={styles.profileWizardAvatarBlock}>
                  <span>Profile image</span>
                  <div className={styles.profileWizardAvatarPreview}>
                    <img src={avatarUrl} alt="" />
                    <button
                      type="button"
                      aria-label="Upload profile image"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={busy !== null}
                    >
                      <Camera size={18} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.profileWizardFieldGrid}>
                <label className={styles.profileWizardField}>
                  <span>Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Your name"
                  />
                </label>

                <label className={styles.profileWizardField}>
                  <span>Username</span>
                  <span className={styles.profileWizardInputIcon}>
                    <AtSign size={16} strokeWidth={1.8} />
                    <input
                      value={form.username}
                      onChange={(event) => updateField("username", event.target.value)}
                      placeholder="@member"
                    />
                  </span>
                </label>

                <label className={styles.profileWizardField}>
                  <span>Email</span>
                  <span className={styles.profileWizardInputIcon}>
                    <Mail size={16} strokeWidth={1.8} />
                    <input
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      placeholder="hello@example.com"
                    />
                  </span>
                </label>

                <label className={styles.profileWizardField}>
                  <span>Address</span>
                  <span className={styles.profileWizardInputIcon}>
                    <MapPin size={16} strokeWidth={1.8} />
                    <input
                      value={form.address}
                      onChange={(event) => updateField("address", event.target.value)}
                      placeholder="New York, NY"
                    />
                  </span>
                </label>

                <label className={`${styles.profileWizardField} ${styles.profileWizardFieldFull}`}>
                  <span>Cover image</span>
                  <button
                    type="button"
                    className={styles.profileWizardCoverUpload}
                    style={{ backgroundImage: `url(${coverUrl})` }}
                    onClick={() => coverInputRef.current?.click()}
                    disabled={busy !== null}
                  >
                    <span>
                      <ImageIcon size={18} strokeWidth={1.8} />
                      {busy === "cover" ? "Uploading cover..." : "Change cover image"}
                    </span>
                  </button>
                </label>

                <label className={`${styles.profileWizardField} ${styles.profileWizardFieldFull}`}>
                  <span>Description</span>
                  <textarea
                    value={form.bio}
                    maxLength={BIO_LIMIT}
                    rows={4}
                    onChange={(event) => updateField("bio", event.target.value.slice(0, BIO_LIMIT))}
                    placeholder="Tell the community a little about you."
                  />
                  <small>{bioCount}/{BIO_LIMIT} letters</small>
                </label>
              </div>

              <div className={styles.profileWizardOptionGroup}>
                <div>
                  <span className={styles.profileWizardGroupLabel}>Profile visibility</span>
                  <small>You can change this anytime.</small>
                </div>

                <div className={styles.profileWizardVisibilityGrid}>
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.profileWizardChoiceCard} ${
                        form.profileVisibility === option.value ? styles.profileWizardChoiceActive : ""
                      }`}
                      aria-pressed={form.profileVisibility === option.value}
                      onClick={() => updateField("profileVisibility", option.value)}
                    >
                      {option.icon}
                      <strong>{option.label}</strong>
                      <span>{option.copy}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div>
                <h2 id="profile-wizard-title" className={styles.profileWizardTitle}>
                  Tell us more about you.
                </h2>
                <p className={styles.profileWizardCopy}>
                  Add your links, interests, and a few personal details for your profile.
                </p>
              </div>

              <div className={styles.profileWizardIconSection}>
                <Link size={20} strokeWidth={1.8} />
                <div className={styles.profileWizardFieldGrid}>
                  {socialFields.map((field) => (
                    <label
                      key={field.key}
                      className={`${styles.profileWizardField} ${
                        field.key === "emailLink" ? styles.profileWizardFieldFull : ""
                      }`}
                    >
                      <span>{field.label}</span>
                      <input
                        value={form[field.key]}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.profileWizardIconSection}>
                <Tag size={20} strokeWidth={1.8} />
                <div className={styles.profileWizardFieldGrid}>
                  {listFields.map((field) => (
                    <label key={field.key} className={styles.profileWizardField}>
                      <span>{field.label}</span>
                      <input
                        value={form[field.key]}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.profileWizardIconSection}>
                <Heart size={20} strokeWidth={1.8} />
                <div className={styles.profileWizardOptionGroup}>
                  <span className={styles.profileWizardGroupLabel}>Marital status</span>
                  <div className={styles.profileWizardPillGrid}>
                    {maritalOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.profileWizardPill} ${
                          form.maritalStatus === option ? styles.profileWizardPillActive : ""
                        }`}
                        aria-pressed={form.maritalStatus === option}
                        onClick={() => updateField("maritalStatus", option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.profileWizardIconSection}>
                <Smile size={20} strokeWidth={1.8} />
                <label className={`${styles.profileWizardField} ${styles.profileWizardFieldFull}`}>
                  <span>Personal question</span>
                  <span className={styles.profileWizardQuestionHint}>
                    <User size={15} strokeWidth={1.8} />
                    What would you like people to know before they connect with you?
                  </span>
                  <textarea
                    value={form.personalQuestion}
                    maxLength={300}
                    rows={4}
                    onChange={(event) => updateField("personalQuestion", event.target.value)}
                    placeholder="Share a short answer."
                  />
                </label>
              </div>

            </>
          ) : step === 3 ? (
            <>
              <div>
                <h2 id="profile-wizard-title" className={styles.profileWizardTitle}>
                  Which blog categories interest you?
                </h2>
                <p className={styles.profileWizardCopy}>
                  Select up to three categories you want to see more often.
                </p>
              </div>

              <div className={styles.profileWizardOptionGroup}>
                <div className={styles.profileWizardSelectionTopline}>
                  <span className={styles.profileWizardGroupLabel}>Blog categories</span>
                  <small>{form.blogCategoryInterests.length}/{MAX_CATEGORY_SELECTIONS} selected</small>
                </div>

                <div className={styles.profileWizardCategoryGrid}>
                  {blogCategoryOptions.map((option) => {
                    const selected = form.blogCategoryInterests.includes(option.label);
                    const disabled =
                      !selected && form.blogCategoryInterests.length >= MAX_CATEGORY_SELECTIONS;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        className={`${styles.profileWizardCategoryCard} ${
                          selected ? styles.profileWizardCategoryActive : ""
                        }`}
                        aria-pressed={selected}
                        onClick={() => toggleCategory("blogCategoryInterests", option.label)}
                        disabled={disabled}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {selected ? (
                          <span className={styles.profileWizardCategoryCheck}>
                            <Check size={13} strokeWidth={2.2} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className={`${styles.profileWizardField} ${styles.profileWizardFieldFull}`}>
                <span>Why did you choose these categories? (optional)</span>
                <textarea
                  value={form.blogCategoryReason}
                  maxLength={300}
                  rows={4}
                  onChange={(event) => updateField("blogCategoryReason", event.target.value)}
                  placeholder="Optional"
                />
              </label>
            </>
          ) : step === 4 ? (
            <>
              <div>
                <h2 id="profile-wizard-title" className={styles.profileWizardTitle}>
                  Which product categories do you use?
                </h2>
                <p className={styles.profileWizardCopy}>
                  Select up to three product categories that match your shopping interests.
                </p>
              </div>

              <div className={styles.profileWizardOptionGroup}>
                <div className={styles.profileWizardSelectionTopline}>
                  <span className={styles.profileWizardGroupLabel}>Product categories</span>
                  <small>{form.productCategoryInterests.length}/{MAX_CATEGORY_SELECTIONS} selected</small>
                </div>

                <div className={styles.profileWizardCategoryGrid}>
                  {productCategoryOptions.map((option) => {
                    const selected = form.productCategoryInterests.includes(option.label);
                    const disabled =
                      !selected && form.productCategoryInterests.length >= MAX_CATEGORY_SELECTIONS;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        className={`${styles.profileWizardCategoryCard} ${
                          selected ? styles.profileWizardCategoryActive : ""
                        }`}
                        aria-pressed={selected}
                        onClick={() => toggleCategory("productCategoryInterests", option.label)}
                        disabled={disabled}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {selected ? (
                          <span className={styles.profileWizardCategoryCheck}>
                            <Check size={13} strokeWidth={2.2} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className={`${styles.profileWizardField} ${styles.profileWizardFieldFull}`}>
                <span>Why did you choose these product categories? (optional)</span>
                <textarea
                  value={form.productCategoryReason}
                  maxLength={300}
                  rows={4}
                  onChange={(event) => updateField("productCategoryReason", event.target.value)}
                  placeholder="Optional"
                />
              </label>
            </>
          ) : (
            <>
              <div>
                <h2 id="profile-wizard-title" className={styles.profileWizardTitle}>
                  Join the Asiance community.
                </h2>
                <p className={styles.profileWizardCopy}>
                  Choose the circles you want to join and see in your feed.
                </p>
              </div>

              <div className={styles.profileWizardOptionGroup}>
                <div className={styles.profileWizardSelectionTopline}>
                  <span className={styles.profileWizardGroupLabel}>Circles</span>
                  <small>{form.communityCircleSlugs.length} selected</small>
                </div>

                {groupsLoading ? (
                  <div className={styles.profileWizardCommunityEmpty}>Loading circles...</div>
                ) : groupsError ? (
                  <div className={styles.profileWizardCommunityEmpty}>{groupsError}</div>
                ) : groups.length ? (
                  <div className={styles.profileWizardCommunityGrid}>
                    {groups.map((group) => {
                      const selected = form.communityCircleSlugs.includes(group.slug);
                      const imageUrl = group.image || group.coverPhoto || group.profilePicture || FALLBACK_COVER;

                      return (
                        <button
                          key={group.slug}
                          type="button"
                          className={`${styles.profileWizardCommunityCard} ${
                            selected ? styles.profileWizardCommunityActive : ""
                          }`}
                          aria-pressed={selected}
                          onClick={() => toggleCommunityCircle(group.slug)}
                        >
                          <img src={imageUrl} alt="" />
                          {selected ? (
                            <span className={styles.profileWizardCommunityCheck}>
                              <Check size={14} strokeWidth={2.4} />
                            </span>
                          ) : null}
                          <strong>{group.name}</strong>
                          <span>{group.membersCount} members</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.profileWizardCommunityEmpty}>No circles are available yet.</div>
                )}
              </div>

              <div className={styles.profileWizardCompleteCard}>
                <Heart size={24} strokeWidth={1.6} />
                <div>
                  <strong>You're all set!</strong>
                  <span>Create your profile and start connecting with the Asiance community.</span>
                </div>
              </div>
            </>
          )}
        </div>

        {error ? <p className={styles.profileWizardError}>{error}</p> : null}

        <footer className={styles.profileWizardFooter}>
          {step === 1 ? (
            <button type="button" className={styles.profileWizardTextButton} onClick={onClose}>
              Skip for now
            </button>
          ) : (
            <button
              type="button"
              className={styles.profileWizardTextButton}
              onClick={goBack}
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
              Back
            </button>
          )}

          {step < STEP_COUNT ? (
            <button
              type="button"
              className={styles.profileWizardPrimary}
              onClick={goNext}
              disabled={busy !== null}
            >
              Next
              <ArrowRight size={16} strokeWidth={1.8} />
            </button>
          ) : (
            <button
              type="button"
              className={styles.profileWizardPrimary}
              onClick={() => void saveAndClose()}
              disabled={busy !== null}
            >
              {busy === "save" ? "Saving..." : "Create my profile"}
              <ArrowRight size={16} strokeWidth={1.8} />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
