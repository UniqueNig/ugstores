import { mergeTypeDefs } from "@graphql-tools/merge";

import userType from "./user";
import productType from "@/src/features/products/graphql/typeDefs";
import categoryType from "./category";
import orderType from "./order";
import settingsType from "./settings";
import couponType from "./coupon";
import contentType from "./content";
import reviewType from "./review";

export const typeDefs = mergeTypeDefs([
  userType,
  productType,
  categoryType,
  orderType,
  settingsType,
  couponType,
  contentType,
  reviewType,
]);
