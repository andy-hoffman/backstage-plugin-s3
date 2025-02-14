import {
  BucketDetails,
  BucketStats,
} from '@spreadshirt/backstage-plugin-s3-viewer-common';
import { BucketDetailsFilters } from './permissions';

export type S3Platform = {
  endpoint: string;
  endpointName: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export type BucketCredentials = S3Platform & {
  bucket: string;
};

export interface CredentialsProvider {
  /**
   * Iterates over the configured platforms and fetches the
   * credentials for each bucket found in there. These credentials
   * will be used to fetch keys & objects in the UI.
   */
  getBucketCredentials(): Promise<BucketCredentials[]>;
}

export interface BucketsProvider {
  /**
   * Fetches all the buckets for the configured endpoints.
   * This method is called by `start()`, but this is exported
   * so it can be called from other places if needed.
   */
  fetchBuckets(): Promise<void>;

  /**
   * Returns all the discovered bucket names. The list can be filtered out
   * if a conditional permission was used in a custom permission policy.
   *
   * @param filter The filter used to filter the buckets
   */
  getAllBuckets(filter?: BucketDetailsFilters): string[];

  /**
   * Returns all the bucket names found for a certain endpoint. This list can
   * be filtered out if a conditional permission has been defined in the
   * permission backend.
   *
   * @param endpoint The endpoint to fetch the bucket names
   * @param filter The filter used to filter the buckets
   */
  getBucketsByEndpoint(
    endpoint: string,
    filter?: BucketDetailsFilters,
  ): string[];

  /**
   * Returns all the bucket names grouped by the endpoint where
   * they are located. Used for the tree view in the UI. This list
   * can be filtered out if a conditional permission has been
   * defined in the permission backend.
   *
   * @param filter The filter used to filter the buckets
   */
  getGroupedBuckets(filter?: BucketDetailsFilters): Record<string, string[]>;

  /**
   * Gets the bucket details or `undefined` if not found.
   *
   * @param endpoint The endpoint where the bucket is located
   * @param bucket The bucket name to fetch info from
   */
  getBucketInfo(endpoint: string, bucket: string): BucketDetails | undefined;

  /**
   * Gets the credentials stored to read from a bucket in a certain endpoint,
   * or `undefined` if not found.
   *
   * @param endpoint The endpoint where the bucket is located
   * @param bucket The bucket name to fetch the credentials
   */
  getCredentialsForBucket(
    endpoint: string,
    bucket: string,
  ): BucketCredentials | undefined;
}

export interface BucketStatsProvider {
  /**
   * Returns the bucket stats for a certain bucket. It's not possible
   * to fetch this data from the S3 API, so it has to be a custom
   * method fetching the data from an external source.
   *
   * @param endpoint The endpoint where the bucket is located
   * @param bucket The bucket name to fetch the stats
   */
  getStats(endpoint: string, bucket: string): Promise<BucketStats>;
}
