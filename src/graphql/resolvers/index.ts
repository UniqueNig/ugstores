import { categoryResolvers } from "./categoryResolver";
import { orderResolvers } from "./orderResolver";
import { productResolvers } from "@/src/features/products/graphql/resolver";
import { settingsResolvers } from "./settingsResolver";
import { userResolvers } from "./userResolver";
import { couponResolvers } from "./couponResolver";
import { contentResolvers } from "./contentResolver";
import { reviewResolvers } from "./reviewResolver";
import { mergeResolvers } from "@graphql-tools/merge";

export const resolvers = mergeResolvers([
  userResolvers,
  productResolvers,
  categoryResolvers,
  orderResolvers,
  settingsResolvers,
  couponResolvers,
  contentResolvers,
  reviewResolvers,
]);
