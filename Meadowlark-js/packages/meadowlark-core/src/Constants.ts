// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

export abstract class Constants {
  static readonly swaggerResourceUrl: string =
    'https://edfidata.s3.us-west-2.amazonaws.com/Meadowlark/3.3.0-b-resource.json';

  static readonly swaggerDescriptorUrl: string =
    'https://edfidata.s3.us-west-2.amazonaws.com/Meadowlark/3.3.0-b-descriptor.json';

  static readonly dependenciesUrl: string =
    'https://edfidata.s3.us-west-2.amazonaws.com/Meadowlark/v3.3.0-b.dependencies.json';
}
