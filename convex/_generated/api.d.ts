/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as billing from "../billing.js";
import type * as campaigns from "../campaigns.js";
import type * as companies from "../companies.js";
import type * as contacts from "../contacts.js";
import type * as emailSequences from "../emailSequences.js";
import type * as leadScoring from "../leadScoring.js";
import type * as scraperJobs from "../scraperJobs.js";
import type * as seed from "../seed.js";
import type * as seedExtended from "../seedExtended.js";
import type * as team from "../team.js";
import type * as whiteLabel from "../whiteLabel.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  billing: typeof billing;
  campaigns: typeof campaigns;
  companies: typeof companies;
  contacts: typeof contacts;
  emailSequences: typeof emailSequences;
  leadScoring: typeof leadScoring;
  scraperJobs: typeof scraperJobs;
  seed: typeof seed;
  seedExtended: typeof seedExtended;
  team: typeof team;
  whiteLabel: typeof whiteLabel;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
