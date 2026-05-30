import "server-only";
import { connectDB } from "@/src/lib/db";
import shippingMethodModel from "@/src/models/ShippingMethod";
import teamMemberModel from "@/src/models/TeamMember";
import testimonialModel from "@/src/models/Testimonial";

export type ShippingMethodDTO = {
  id: string;
  label: string;
  description: string;
  cost: number;
  active: boolean;
  sortOrder: number;
};
export type TeamMemberDTO = {
  id: string;
  name: string;
  role: string;
  image: string;
  sortOrder: number;
};
export type TestimonialDTO = {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  active: boolean;
  sortOrder: number;
};

// ── Default seed data — keeps the storefront looking complete out of the box,
//    and gives the admin editable records instead of hardcoded markup. ──────

// U.G STORES delivery fees by location (from the client's intake). She delivers
// nationwide (Southwest fastest); other locations can be added in /admin/shipping.
const DEFAULT_SHIPPING = [
  { label: "Ibadan", description: "Within Ibadan · 3–21 working days", cost: 2000, sortOrder: 0 },
  { label: "Abeokuta", description: "Abeokuta, Ogun State · 3–21 working days", cost: 3000, sortOrder: 1 },
  { label: "Ogun State (other areas)", description: "Other parts of Ogun State · 3–21 working days", cost: 4000, sortOrder: 2 },
  { label: "Lagos", description: "Anywhere in Lagos · 3–21 working days", cost: 5000, sortOrder: 3 },
  { label: "Ondo", description: "Ondo State · 3–21 working days", cost: 7000, sortOrder: 4 },
];

// No fake team/testimonials seeded — the client adds real ones in the admin.
// (The homepage Testimonials and About Team sections both hide when empty.)
const DEFAULT_TEAM: { name: string; role: string; image: string; sortOrder: number }[] = [];

const DEFAULT_TESTIMONIALS: { name: string; location: string; text: string; rating: number; sortOrder: number }[] = [];

// ── Public reads (active only), seeding defaults on first run ──────────────

export async function getShippingMethods(): Promise<ShippingMethodDTO[]> {
  await connectDB();
  if (DEFAULT_SHIPPING.length && (await shippingMethodModel.estimatedDocumentCount()) === 0) {
    await shippingMethodModel.insertMany(DEFAULT_SHIPPING);
  }
  const docs = await shippingMethodModel.find({ active: true }).sort({ sortOrder: 1, cost: 1 }).lean();
  return docs.map(mapShipping);
}

export async function getTeamMembers(): Promise<TeamMemberDTO[]> {
  await connectDB();
  if (DEFAULT_TEAM.length && (await teamMemberModel.estimatedDocumentCount()) === 0) {
    await teamMemberModel.insertMany(DEFAULT_TEAM);
  }
  const docs = await teamMemberModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return docs.map(mapTeam);
}

export async function getTestimonials(): Promise<TestimonialDTO[]> {
  await connectDB();
  if (DEFAULT_TESTIMONIALS.length && (await testimonialModel.estimatedDocumentCount()) === 0) {
    await testimonialModel.insertMany(DEFAULT_TESTIMONIALS);
  }
  const docs = await testimonialModel.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return docs.map(mapTestimonial);
}

// ── Mappers (shared with the GraphQL resolver) ─────────────────────────────

export const mapShipping = (d: any): ShippingMethodDTO => ({
  id: d._id.toString(),
  label: d.label,
  description: d.description ?? "",
  cost: d.cost,
  active: d.active ?? true,
  sortOrder: d.sortOrder ?? 0,
});
export const mapTeam = (d: any): TeamMemberDTO => ({
  id: d._id.toString(),
  name: d.name,
  role: d.role ?? "",
  image: d.image ?? "",
  sortOrder: d.sortOrder ?? 0,
});
export const mapTestimonial = (d: any): TestimonialDTO => ({
  id: d._id.toString(),
  name: d.name,
  location: d.location ?? "",
  text: d.text,
  rating: d.rating ?? 5,
  active: d.active ?? true,
  sortOrder: d.sortOrder ?? 0,
});
