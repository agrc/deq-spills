# Changelog

## [3.0.3-rc.1](https://github.com/agrc/deq-spills/compare/v3.0.2...v3.0.3-rc.1) (2026-01-19)


### Features

* implement flow paths ([6cb4790](https://github.com/agrc/deq-spills/commit/6cb4790387afa14f77777f67801c2cbf4949678c)), closes [#129](https://github.com/agrc/deq-spills/issues/129)

## [3.0.2](https://github.com/agrc/deq-spills/compare/v3.0.1...v3.0.2) (2025-12-22)


### Bug Fixes

* point to new source for environmental incidents ([947db5e](https://github.com/agrc/deq-spills/commit/947db5e945f55456ab760d35236a1e445d550529))

## [3.0.1](https://github.com/agrc/deq-spills/compare/v3.0.0...v3.0.1) (2025-11-11)


### Dependencies

* bump the major-dependencies group across 3 directories with 13 updates ([6983adb](https://github.com/agrc/deq-spills/commit/6983adbe5f5f5c0d99532c9ccc9c6f5dc5b1cbca))
* bump the safe-dependencies group across 2 directories with 20 updates ([79861e4](https://github.com/agrc/deq-spills/commit/79861e46d7cf5b6d84e25d131bf44151990bf4a7))

## [3.0.0](https://github.com/agrc/deq-spills/compare/v2.11.6...v3.0.0) (2025-10-27)


### ⚠ BREAKING CHANGES

* Begin total rewrite of application using React and newer Esri libraries.

### Features

* implement data context and hooks for managing state and iframe communication ([018b4ac](https://github.com/agrc/deq-spills/commit/018b4ac1138f26d5d962e730c2f0630c1e0a23fe)), closes [#148](https://github.com/agrc/deq-spills/issues/148)
* implement updating coordinates via map click ([157d871](https://github.com/agrc/deq-spills/commit/157d8713825b51d04e76d09170e18ab5f79ea5a5)), closes [#131](https://github.com/agrc/deq-spills/issues/131)
* **salesforce:** add `isReadOnly` prop to spills component ([843cfc6](https://github.com/agrc/deq-spills/commit/843cfc6ac86da6a81327b109371fe2078823ce6a)), closes [#133](https://github.com/agrc/deq-spills/issues/133)
* **website:** add a confirmation dialog to handle accidental map clicks ([c545bca](https://github.com/agrc/deq-spills/commit/c545bca2765611305f8561ae9ab4081163ae6b11)), closes [#142](https://github.com/agrc/deq-spills/issues/142)
* **website:** add legend and labels for land ownership ([e3019e9](https://github.com/agrc/deq-spills/commit/e3019e96d1951fba1749ad8bf67c06c80609706d)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** add sidebar that displays data from URL parameters for standalone mode ([f36fa1c](https://github.com/agrc/deq-spills/commit/f36fa1c7107c1773c37518379c560e738baa645c))
* **website:** add spill number and field aliases to standalone sidebar ([b46b65e](https://github.com/agrc/deq-spills/commit/b46b65ef952a54fbe8d2aca126f75bf8d6b38c13))
* **website:** add water system layer and refine land ownership ([05852e2](https://github.com/agrc/deq-spills/commit/05852e2b345af391212fbd9fe1eebf66523dac02)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** enable mouse wheel zooming when embedded ([bdab475](https://github.com/agrc/deq-spills/commit/bdab475373f03c2790ae900e4c84afbadfa96af1)), closes [#130](https://github.com/agrc/deq-spills/issues/130)
* **website:** implement define location by address or route/milepost ([363cfb5](https://github.com/agrc/deq-spills/commit/363cfb53aac07c9bffa1708f17ba49db379bb38b)), closes [#136](https://github.com/agrc/deq-spills/issues/136)
* **website:** implement define location by coordinates ([8085221](https://github.com/agrc/deq-spills/commit/80852213233f6c0b32eb2312c9594f05ef696edc)), closes [#131](https://github.com/agrc/deq-spills/issues/131)
* **website:** implement other location queries ([a681efa](https://github.com/agrc/deq-spills/commit/a681efa982eaad0be5292d754c2c58545eb29e7a)), closes [#137](https://github.com/agrc/deq-spills/issues/137)
* **website:** implement readonly url parameter ([4c1852c](https://github.com/agrc/deq-spills/commit/4c1852c9d4a92fca4aba55b26ea9706563d00c8f)), closes [#133](https://github.com/agrc/deq-spills/issues/133)


### Bug Fixes

* implement latest atlas template ([5ad4a7a](https://github.com/agrc/deq-spills/commit/5ad4a7a1cbe92e61d17127bb16a51bd6926f8212)), closes [#126](https://github.com/agrc/deq-spills/issues/126)
* **legacy:** add new prod salesforce domain to CSP ([ac32cda](https://github.com/agrc/deq-spills/commit/ac32cdacd1c90c5900bfd8779c4fa5ac19952b06))
* **legacy:** add pbf dependency ([efbf82f](https://github.com/agrc/deq-spills/commit/efbf82fea4218ba00e727226ea2ff3b7fe63792a))
* **legacy:** better headers for iframe security ([d076355](https://github.com/agrc/deq-spills/commit/d076355d6d97f89ea3f9be2b55c5402737a905e0))
* **legacy:** remove broken image min build step ([1e715e1](https://github.com/agrc/deq-spills/commit/1e715e1f9d21965a2795c1106ddad67b1c515d2e))
* **salesforce:** avoid storing "null" strings or a single comma in address field ([8845d7a](https://github.com/agrc/deq-spills/commit/8845d7a3cf58e6592a44080766bb0aa694668c44))
* **salesforce:** set iframe to full width ([1997292](https://github.com/agrc/deq-spills/commit/1997292fcbbda853025c6e9577a67e9211fd00de))
* **website:** add QA and UatPartial DNS for tanks project to CSP ([a20700e](https://github.com/agrc/deq-spills/commit/a20700eb179aa15fa88e7afe149d98e1c6d10dd8))
* **website:** better headers for iframe security ([e9155d9](https://github.com/agrc/deq-spills/commit/e9155d93deffef15f5c83b72ec42f6555365b1a8))
* **website:** disable map click when not embedded ([53792a6](https://github.com/agrc/deq-spills/commit/53792a604036298fd3cfdbaeabd521b66fc7f4b6))
* **website:** enable mouse wheel zooming even when no embedded ([d4ba7f9](https://github.com/agrc/deq-spills/commit/d4ba7f9a0ecd8a493d543e75384a344e470f024b))
* **website:** enable smooth map mouse wheel zooming and more modern base maps ([33785d4](https://github.com/agrc/deq-spills/commit/33785d48b1f01e1e0bb7e11d3fb10c95aa5a68c8))
* **website:** hide legend when empty ([54f2c7e](https://github.com/agrc/deq-spills/commit/54f2c7e2135dd3df7f275c86f7512455701bcdfa)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** include city/zip in address sent to salesforce ([d780fb9](https://github.com/agrc/deq-spills/commit/d780fb99e943713ed3ee4b658260801250f8b104))
* **website:** use correct map click event ([134ee0a](https://github.com/agrc/deq-spills/commit/134ee0a1119339e5e1e4cbae2556c5aea63044ce))
* **website:** wire event listening sooner in react lifecycle ([9723192](https://github.com/agrc/deq-spills/commit/97231924c8507765744077359536f404ee8e3fd6))


### Dependencies

* **salesforce:** update to latest salesforce template project ([43e3976](https://github.com/agrc/deq-spills/commit/43e39768e49194bf2372a512b7bef3db70de1d15)), closes [#126](https://github.com/agrc/deq-spills/issues/126)
* **website:** bump dependencies 🌲 ([31dc86b](https://github.com/agrc/deq-spills/commit/31dc86b3021ce72a00a0085360d6dfe666df5571))
* **website:** bump npm deps 🌲 ([2c8c3c2](https://github.com/agrc/deq-spills/commit/2c8c3c2528018876b1584b4ef80e6eb4622b0ee6))


### Styles

* **website:** override default colors with DEQ logo colors ([747725e](https://github.com/agrc/deq-spills/commit/747725e649e8b0aeed9df828b45cdde16dbf575e))
* **website:** simplify layout and add optimizations for salesforce embed ([e4d6c2b](https://github.com/agrc/deq-spills/commit/e4d6c2b0e9466b48a7e587754d0de1e6873fc3f8))
* **website:** update location point symbol to match the old style ([8e385d1](https://github.com/agrc/deq-spills/commit/8e385d1d68f219eec18c3afecd4cc3d18d549a74))

## [3.0.0-rc.9](https://github.com/agrc/deq-spills/compare/v3.0.0-8...v3.0.0-rc.9) (2025-08-21)


### Bug Fixes

* **website:** enable smooth map mouse wheel zooming and more modern base maps ([b505e29](https://github.com/agrc/deq-spills/commit/b505e291ed641adbc389f5c081ec3966bf78c9ae))


### Dependencies

* **website:** bump npm deps 🌲 ([f6d42df](https://github.com/agrc/deq-spills/commit/f6d42df3460db5bc506651c5b7a6b4afd113be91))

## [3.0.0-8](https://github.com/agrc/deq-spills/compare/v2.11.6...v3.0.0-8) (2025-08-01)


### ⚠ BREAKING CHANGES

* Begin total rewrite of application using React and newer Esri libraries.

### Features

* implement data context and hooks for managing state and iframe communication ([2b59e28](https://github.com/agrc/deq-spills/commit/2b59e28044d6fd9860277a0ca9529733c3fc4588)), closes [#148](https://github.com/agrc/deq-spills/issues/148)
* implement updating coordinates via map click ([6321f17](https://github.com/agrc/deq-spills/commit/6321f171fd05486f77db707b07b69147581289e3)), closes [#131](https://github.com/agrc/deq-spills/issues/131)
* **salesforce:** add `isReadOnly` prop to spills component ([162910a](https://github.com/agrc/deq-spills/commit/162910a9c83385818bdc3605c480f028eacd599f)), closes [#133](https://github.com/agrc/deq-spills/issues/133)
* **website:** add a confirmation dialog to handle accidental map clicks ([0df95f4](https://github.com/agrc/deq-spills/commit/0df95f466602e2df7944719f33a6f05c97fb55ba)), closes [#142](https://github.com/agrc/deq-spills/issues/142)
* **website:** add legend and labels for land ownership ([368b4da](https://github.com/agrc/deq-spills/commit/368b4da0d2584b511867bf3aac8650de33a2bccc)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** add sidebar that displays data from URL parameters for standalone mode ([98bc459](https://github.com/agrc/deq-spills/commit/98bc459ad7de0b2f0828f1e8c985a8818bc80767))
* **website:** add spill number and field aliases to standalone sidebar ([89d88c7](https://github.com/agrc/deq-spills/commit/89d88c70f5918fd1f75b4c30c75d2396e437dc13))
* **website:** add water system layer and refine land ownership ([bac6b54](https://github.com/agrc/deq-spills/commit/bac6b5427644cf67a1f4cd9e686a272559d79534)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** enable mouse wheel zooming when embedded ([a52f854](https://github.com/agrc/deq-spills/commit/a52f854561703f43788b976541538096222cbc6d)), closes [#130](https://github.com/agrc/deq-spills/issues/130)
* **website:** implement define location by address or route/milepost ([e2390da](https://github.com/agrc/deq-spills/commit/e2390dacd8fef4a8e8edf4092ae845b71ef82cec)), closes [#136](https://github.com/agrc/deq-spills/issues/136)
* **website:** implement define location by coordinates ([69fdd15](https://github.com/agrc/deq-spills/commit/69fdd15b943489b050fe6ac755d095e8e55515e3)), closes [#131](https://github.com/agrc/deq-spills/issues/131)
* **website:** implement other location queries ([82f8279](https://github.com/agrc/deq-spills/commit/82f82798ed0dd887f6d6348f3a492659b6ac6bde)), closes [#137](https://github.com/agrc/deq-spills/issues/137)
* **website:** implement readonly url parameter ([925730e](https://github.com/agrc/deq-spills/commit/925730ef8137b3b8b05b86e7bc2bb4e2f7b0c29f)), closes [#133](https://github.com/agrc/deq-spills/issues/133)


### Bug Fixes

* implement latest atlas template ([b24a1ca](https://github.com/agrc/deq-spills/commit/b24a1caeae7a6d48bbdf068dd4b1c516291bc568)), closes [#126](https://github.com/agrc/deq-spills/issues/126)
* **legacy:** add pbf dependency ([28da98f](https://github.com/agrc/deq-spills/commit/28da98ff7c6af03b2e6b8de70d9db11ad3b7dbe7))
* **legacy:** better headers for iframe security ([4735621](https://github.com/agrc/deq-spills/commit/4735621f8765a5a5b6e2d5471a3db1af20ef3cf6))
* **legacy:** remove broken image min build step ([fecd264](https://github.com/agrc/deq-spills/commit/fecd264f38377471a65ce3baa31e2c37f2690c94))
* **salesforce:** avoid storing "null" strings or a single comma in address field ([a64c136](https://github.com/agrc/deq-spills/commit/a64c136818bcdef751dc9b3162984a2b8e5fa8b4))
* **salesforce:** set iframe to full width ([3eb51cb](https://github.com/agrc/deq-spills/commit/3eb51cb3b24c5e8a2985d20ab74221be7002d98b))
* **website:** add QA and UatPartial DNS for tanks project to CSP ([ce79ed8](https://github.com/agrc/deq-spills/commit/ce79ed806aef2bba53ae75ad19bd4c84f05bfbe3))
* **website:** better headers for iframe security ([2f16221](https://github.com/agrc/deq-spills/commit/2f1622103343a8065e29126e299bf5878ceccaae))
* **website:** disable map click when not embedded ([495ffb5](https://github.com/agrc/deq-spills/commit/495ffb5777237fcf976d9733eb15706f29152319))
* **website:** enable mouse wheel zooming even when no embedded ([d15410a](https://github.com/agrc/deq-spills/commit/d15410abe6fd0e319c7f4b1ae4d10866fda44ace))
* **website:** hide legend when empty ([678fafe](https://github.com/agrc/deq-spills/commit/678fafe14e39d62a355927ce899ca5eb3752c2b0)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** include city/zip in address sent to salesforce ([b1ec5e9](https://github.com/agrc/deq-spills/commit/b1ec5e99c8298533bd3a4844776dc0841e50c57d))
* **website:** wire event listening sooner in react lifecycle ([8c1fb02](https://github.com/agrc/deq-spills/commit/8c1fb02a7f3c012af5f2bcc4f5e153ae8281268a))


### Dependencies

* **salesforce:** update to latest salesforce template project ([b51bea2](https://github.com/agrc/deq-spills/commit/b51bea26578b6641d2e1cb3e2cbcc4c75dda2740)), closes [#126](https://github.com/agrc/deq-spills/issues/126)
* **website:** bump dependencies 🌲 ([3935299](https://github.com/agrc/deq-spills/commit/39352998811a05bc795ee17810e3ad7571c749c0))


### Styles

* **website:** override default colors with DEQ logo colors ([b138f39](https://github.com/agrc/deq-spills/commit/b138f39f6a50f025b42feec170c40a527801e045))
* **website:** simplify layout and add optimizations for salesforce embed ([edb65e8](https://github.com/agrc/deq-spills/commit/edb65e865253cbb08cfa23afc683fb1c0e3f71bd))
* **website:** update location point symbol to match the old style ([3a21d10](https://github.com/agrc/deq-spills/commit/3a21d107b95cfb6d8819e5abb1815fd5edc2e825))

## [3.0.0-7](https://github.com/agrc/deq-spills/compare/v3.0.0-6...v3.0.0-7) (2025-07-17)


### Bug Fixes

* **legacy:** add pbf dependency ([6f32814](https://github.com/agrc/deq-spills/commit/6f328143bf080062c7bdeeb51e9c3b99da800a4c))
* **legacy:** better headers for iframe security ([15ac9fa](https://github.com/agrc/deq-spills/commit/15ac9fa3d7cf41da1111cadc453c71c5c8ee5575))
* **website:** better headers for iframe security ([c3c77d8](https://github.com/agrc/deq-spills/commit/c3c77d807c2ecfb99c4e5465915468aa2fe832a4))

## [3.0.0-6](https://github.com/agrc/deq-spills/compare/v3.0.0-5...v3.0.0-6) (2025-07-08)


### Bug Fixes

* **website:** add QA and UatPartial DNS for tanks project to CSP ([bf6d6bf](https://github.com/agrc/deq-spills/commit/bf6d6bf84b7b9cd61ee67a5118a3a2d0ce0aebda))

## [3.0.0-5](https://github.com/agrc/deq-spills/compare/v3.0.0-4...v3.0.0-5) (2025-04-04)


### Features

* **salesforce:** add `isReadOnly` prop to spills component ([21ec85a](https://github.com/agrc/deq-spills/commit/21ec85abc40101291dd08212c9c2da7e79536cad)), closes [#133](https://github.com/agrc/deq-spills/issues/133)
* **website:** add sidebar that displays data from URL parameters for standalone mode ([b9f3815](https://github.com/agrc/deq-spills/commit/b9f3815269e3b232c7a584ecffea71e47b039042))
* **website:** add spill number and field aliases to standalone sidebar ([a75a603](https://github.com/agrc/deq-spills/commit/a75a60334d1419ef0130f76f6a9b9951f374ac03))
* **website:** implement readonly url parameter ([f6182c7](https://github.com/agrc/deq-spills/commit/f6182c76148711cfe4dc70086fe072a72ab5f10e)), closes [#133](https://github.com/agrc/deq-spills/issues/133)


### Bug Fixes

* **website:** disable map click when not embedded ([fee0029](https://github.com/agrc/deq-spills/commit/fee0029a8caa893e7ec060715702b25545b2d8f8))


### Dependencies

* **website:** bump dependencies 🌲 ([1d37e65](https://github.com/agrc/deq-spills/commit/1d37e657f11c6b98b31bee5bf5353f58e28f40ec))

## [3.0.0-4](https://github.com/agrc/deq-spills/compare/v3.0.0-3...v3.0.0-4) (2025-03-12)


### Bug Fixes

* **website:** include city/zip in address sent to salesforce ([93a345e](https://github.com/agrc/deq-spills/commit/93a345e3e0ec410f137996a347d8fa78ba10f2c4))

## [3.0.0-3](https://github.com/agrc/deq-spills/compare/v3.0.0-2...v3.0.0-3) (2025-03-10)


### Features

* implement data context and hooks for managing state and iframe communication ([48fe06e](https://github.com/agrc/deq-spills/commit/48fe06e6acb4265aa2d4fb75015b434ba20d186d)), closes [#148](https://github.com/agrc/deq-spills/issues/148)
* implement updating coordinates via map click ([ee7854a](https://github.com/agrc/deq-spills/commit/ee7854a49609807fe87b7772305b098cae26d8c5)), closes [#131](https://github.com/agrc/deq-spills/issues/131)
* **website:** add a confirmation dialog to handle accidental map clicks ([c846535](https://github.com/agrc/deq-spills/commit/c846535faaf807c8e4454ed3be6318868414cd29)), closes [#142](https://github.com/agrc/deq-spills/issues/142)
* **website:** implement define location by address or route/milepost ([5e431fd](https://github.com/agrc/deq-spills/commit/5e431fd69611acd5e7ebbe50f9b16daef11eabd7)), closes [#136](https://github.com/agrc/deq-spills/issues/136)
* **website:** implement define location by coordinates ([4491d00](https://github.com/agrc/deq-spills/commit/4491d000bbbd11ba366ccb2737254565fbc6bd05)), closes [#131](https://github.com/agrc/deq-spills/issues/131)
* **website:** implement other location queries ([ff365ba](https://github.com/agrc/deq-spills/commit/ff365ba36703bbc2930ead1173e2d5224393d19b)), closes [#137](https://github.com/agrc/deq-spills/issues/137)


### Bug Fixes

* **salesforce:** avoid storing "null" strings or a single comma in address field ([4d8d12d](https://github.com/agrc/deq-spills/commit/4d8d12d4726b214d0a859a707740f2fdaa85ac1d))
* **salesforce:** set iframe to full width ([b55c129](https://github.com/agrc/deq-spills/commit/b55c1291c274b32c5f21c336024d296a7d548d92))
* **website:** wire event listening sooner in react lifecycle ([3eb2617](https://github.com/agrc/deq-spills/commit/3eb2617046d93b8dd3c6370c9c9e2fcbcafde088))


### Styles

* **website:** update location point symbol to match the old style ([bf6934e](https://github.com/agrc/deq-spills/commit/bf6934e37e1dd239099b757cbbce86be60cde041))

## [3.0.0-2](https://github.com/agrc/deq-spills/compare/v3.0.0-1...v3.0.0-2) (2025-02-21)


### Features

* **website:** add legend and labels for land ownership ([a588083](https://github.com/agrc/deq-spills/commit/a588083e82c4c64b70ec74ca04a89d77d59aeb4b)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** add water system layer and refine land ownership ([4500a11](https://github.com/agrc/deq-spills/commit/4500a11a2446d98d840d02dbadafbd16ac1a114c)), closes [#128](https://github.com/agrc/deq-spills/issues/128)
* **website:** enable mouse wheel zooming when embedded ([0672090](https://github.com/agrc/deq-spills/commit/0672090af1d38729c534171d26068b52f795e034)), closes [#130](https://github.com/agrc/deq-spills/issues/130)


### Bug Fixes

* **website:** enable mouse wheel zooming even when no embedded ([7f450e3](https://github.com/agrc/deq-spills/commit/7f450e30a1b8c253e03232455d458bac455c56ce))
* **website:** hide legend when empty ([ff82529](https://github.com/agrc/deq-spills/commit/ff82529d9d78c59a840d2b618d938e94f6d23e13)), closes [#128](https://github.com/agrc/deq-spills/issues/128)


### Styles

* **website:** override default colors with DEQ logo colors ([031e12c](https://github.com/agrc/deq-spills/commit/031e12c18028fc1d72f1b7e96745cde57e075666))
* **website:** simplify layout and add optimizations for salesforce embed ([0a51029](https://github.com/agrc/deq-spills/commit/0a5102930f01cc513c946e72801d106c79d5de0a))

## [3.0.0-1](https://github.com/agrc/deq-spills/compare/v3.0.0-0...v3.0.0-1) (2025-02-05)


### Bug Fixes

* **legacy:** remove broken image min build step ([f1cd52c](https://github.com/agrc/deq-spills/commit/f1cd52c8b92e388550cc1cc8c40fbf7b5a96d724))

## [3.0.0-0](https://github.com/agrc/deq-spills/compare/v2.11.6...v3.0.0-0) (2025-02-05)

### ⚠ BREAKING CHANGES

- Begin total rewrite of application using React and newer Esri libraries.

### Bug Fixes

- implement latest atlas template ([7068891](https://github.com/agrc/deq-spills/commit/70688914914d180bde06583c055bdad901484912)), closes [#126](https://github.com/agrc/deq-spills/issues/126)

### Dependencies

- **salesforce:** update to latest salesforce template project ([f275f76](https://github.com/agrc/deq-spills/commit/f275f7681b3befb7f00313217a85770a2b8e3bcb)), closes [#126](https://github.com/agrc/deq-spills/issues/126)

## [2.11.6](https://github.com/agrc/deq-spills/compare/v2.11.5...v2.11.6) (2025-01-07)

### Dependencies

- **dev:** bump the safe-dependencies group across 1 directory with 2 updates ([1ac522a](https://github.com/agrc/deq-spills/commit/1ac522a9b8ce5b4d9aecd4d28b35b97f52160c6b))

## [2.11.5](https://github.com/agrc/deq-spills/compare/v2.11.4...v2.11.5) (2024-09-27)

### Dependencies

- **dev:** bump serve-static in the npm_and_yarn group ([cfb1d53](https://github.com/agrc/deq-spills/commit/cfb1d535164453a12654123c92bbdc2b8dbf7b5a))
- **dev:** bump the major-dependencies group with 2 updates ([d991f55](https://github.com/agrc/deq-spills/commit/d991f55e84ba8d5a883e8118d9b6637def28d8e9))

## [2.11.4](https://github.com/agrc/deq-spills/compare/v2.11.3...v2.11.4) (2024-08-08)

### Bug Fixes

- pin uglify to workaround breaking change ([fa9053c](https://github.com/agrc/deq-spills/commit/fa9053cb3a8329866e9d2023d11cdbc0812ff707))

## [2.11.3](https://github.com/agrc/deq-spills/compare/v2.11.2...v2.11.3) (2024-08-08)

### Bug Fixes

- correct params for web api requests to match open sgid ([2d367d5](https://github.com/agrc/deq-spills/commit/2d367d508248e0df3f106dff3e9116a06e73c034))

### Dependencies

- **dev:** bump uglify-js in the safe-dependencies group ([fab0aa7](https://github.com/agrc/deq-spills/commit/fab0aa7c548c4e9fdb33349b5d5fd74df8394b9a))

## [2.11.3-1](https://github.com/agrc/deq-spills/compare/v2.11.2...v2.11.3-1) (2024-08-08)

### Bug Fixes

- correct params for web api requests to match open sgid ([227403e](https://github.com/agrc/deq-spills/commit/227403ef98c14c7d7e4196de8a9e835dc4226593))

### Dependencies

- **dev:** bump uglify-js in the safe-dependencies group ([e96c963](https://github.com/agrc/deq-spills/commit/e96c963992687d5c20e5bbf29e6e9cd9ff2d7e18))

## [2.11.2](https://github.com/agrc/deq-spills/compare/v2.11.1...v2.11.2) (2024-05-24)

### 🐛 Bug Fixes

- fix bug causing salesforce component to update more than one record at a time ([6d8ae40](https://github.com/agrc/deq-spills/commit/6d8ae4057f388345c2f5450fec37d3c833af3c37))

## [2.11.1](https://github.com/agrc/deq-spills/compare/v2.11.0...v2.11.1) (2024-04-16)

### 🐛 Bug Fixes

- Migrate to SITLA vector tiles ([fec5a92](https://github.com/agrc/deq-spills/commit/fec5a92ebf6a97361a150941626dc2a09bbd0cca))

## [2.11.0](https://github.com/agrc/deq-spills/compare/v2.10.1...v2.11.0) (2024-04-11)

### 🚀 Features

- add analytics ([6bffcab](https://github.com/agrc/deq-spills/commit/6bffcab0eedeb626556090a64ce03844dbe75a8d))

## [2.10.1](https://github.com/agrc/deq-spills/compare/v2.10.0...v2.10.1) (2024-03-28)

### 🐛 Bug Fixes

- **ci:** add missing repo token ([8d4933c](https://github.com/agrc/deq-spills/commit/8d4933c3f4fb84690a7211566028c042e1646852))

## [2.10.0](https://github.com/agrc/deq-spills/compare/v2.10.0-4...v2.10.0) (2024-03-28)

### 🐛 Bug Fixes

- clean up log ([8a53e99](https://github.com/agrc/deq-spills/commit/8a53e999c6c7ebb4b5ca7ae31736fb57a478676a))

## [2.10.0-4](https://github.com/agrc/deq-spills/compare/v2.10.0-3...v2.10.0-4) (2024-03-28)

### 🐛 Bug Fixes

- February dependency bumps 🌲 ([e36c997](https://github.com/agrc/deq-spills/commit/e36c99779cdd28bce8cd365f33a177df0f1ac71b))
- load correct URL based on environment ([01b4292](https://github.com/agrc/deq-spills/commit/01b42920848026d95c69a2c510086db8b9f396f1))
- update map service with new tanks feature class ([523f3e8](https://github.com/agrc/deq-spills/commit/523f3e8eef0cb77c0666eb4edb3248aa3466a2e4))
- update tanks feature class ([76a2f4c](https://github.com/agrc/deq-spills/commit/76a2f4ce6bb651fd0cbc45f1d00825d1e60566dd))

### 📖 Documentation Improvements

- refresh does with salesforce info ([31dffb1](https://github.com/agrc/deq-spills/commit/31dffb1ef32b0cef951023842ea3c890d730f0b6))

### 🎨 Design Improvements

- fix eslint errors ([d7a2b6f](https://github.com/agrc/deq-spills/commit/d7a2b6f962dcac2b3110cd4c0dee91c028ccf824))

## [2.10.0-3](https://github.com/agrc/deq-spills/compare/v2.10.0-2...v2.10.0-3) (2024-03-27)

### 🐛 Bug Fixes

- bump deps 🌲 ([bd056fe](https://github.com/agrc/deq-spills/commit/bd056feb4bdda7077d306e641ee2979cdc601f6a))

## [2.10.0-2](https://github.com/agrc/deq-spills/compare/v2.10.0-1...v2.10.0-2) (2023-10-13)

### 🐛 Bug Fixes

- bug that was causing blank x/y values and and incorrect coord type on load in salesforce ([537cece](https://github.com/agrc/deq-spills/commit/537ceced270962d13df96f63224ad7b37d7c028b))
- don't send analytics in development ([faf481b](https://github.com/agrc/deq-spills/commit/faf481b197d8bcc63db51ba657bcc073ff95f04e))

## [2.10.0-1](https://github.com/agrc/deq-spills/compare/v2.10.0-0...v2.10.0-1) (2023-10-09)

### 🐛 Bug Fixes

- try to prevent mismatched coordinate inputs ([4fb0697](https://github.com/agrc/deq-spills/commit/4fb06976be930800407a0d1815dd0acdb99cc08e))

## [2.10.0-0](https://github.com/agrc/deq-spills/compare/v2.9.0-2...v2.10.0-0) (2023-09-18)

### 🚀 Features

- **salesforce:** write to new lat/long fields ([dcb67c7](https://github.com/agrc/deq-spills/commit/dcb67c716186ebdf1cd21f11ebdd82112f35857c))

### 🐛 Bug Fixes

- disable scroll wheel zooming ([d188c7d](https://github.com/agrc/deq-spills/commit/d188c7d4859aac3dfbce724d2a96db3e0941058a))
- **salesforce:** switch UTM coordinate fields to text ([ec873c7](https://github.com/agrc/deq-spills/commit/ec873c7cf85a23fe327a632d6455ddecefc607a8))

## [2.9.0-2](https://github.com/agrc/deq-spills/compare/v2.9.0-1...v2.9.0-2) (2023-09-18)

### 🐛 Bug Fixes

- **salesforce:** fix bug preventing first location definition if no previous coordinates have been recorded ([fbc700c](https://github.com/agrc/deq-spills/commit/fbc700cec02e1d56fbdcdd622c42c7724ddd7d8b))

## [2.9.0-1](https://github.com/agrc/deq-spills/compare/v2.9.0-0...v2.9.0-1) (2023-09-14)

### 🐛 Bug Fixes

- ignore messages from other windows ([2dbd34f](https://github.com/agrc/deq-spills/commit/2dbd34f26b13af4c504bef67125f09d293706247))
- **salesforce:** prevent address and other data from being cleared out on fresh page load ([f6cb0d4](https://github.com/agrc/deq-spills/commit/f6cb0d4f225a1c00c05618e73417994045e3f5f9))
- **salesforce:** recreate project with manifest and point at deq spills sandbox ([04a4318](https://github.com/agrc/deq-spills/commit/04a43183718bc92f59b8bbb265747a5f2a28d24c))

### 📖 Documentation Improvements

- remove old stuff and add link to SF sandbox ([657fba8](https://github.com/agrc/deq-spills/commit/657fba8d004266144821fbce0c608da752be393a))

## [2.9.0-0](https://github.com/agrc/deq-spills/compare/v2.8.0-0...v2.9.0-0) (2023-09-13)

### 🚀 Features

- **salesforce:** implement basic iframe lightning component ([858dbd3](https://github.com/agrc/deq-spills/commit/858dbd30ad4de0d7e159d7e6e9b13000a0124a96))

### 🐛 Bug Fixes

- change demo page to work with salesforce web component as iframe ([96fbf7d](https://github.com/agrc/deq-spills/commit/96fbf7d0cd48c741c4f3910265ef145db265b293))

## [2.8.0-0](https://github.com/agrc/deq-spills/compare/v2.7.3...v2.8.0-0) (2023-02-22)

### 📖 Documentation Improvements

- fix DNS in example ([ea2442d](https://github.com/agrc/deq-spills/commit/ea2442dfe586c07e9c0ea4bdee8af322dd0ffbc1))

### 🚀 Features

- add google analytics ([344e6fa](https://github.com/agrc/deq-spills/commit/344e6fa718102ca483a6883d68b47154738f2c66))
- add support for AGRC_testQuadWord ([dac4390](https://github.com/agrc/deq-spills/commit/dac4390504b071cfb9c20b144d4e106ecbd3d21c))

### 🐛 Bug Fixes

- add CORS support ([ed42a29](https://github.com/agrc/deq-spills/commit/ed42a297f19e7b8df9b588e529b8de6d48473797))
- add cors to font files ([d72f56f](https://github.com/agrc/deq-spills/commit/d72f56f7947498ae06633d40b45fe1cf09ec278d))
- **build:** dojo optimize -&gt; uglify ([4dad1d0](https://github.com/agrc/deq-spills/commit/4dad1d0c39d4e9230b38266639335711f6e6b348))
- combine headers ([af34d89](https://github.com/agrc/deq-spills/commit/af34d890deeb36e5c804736fda56efb40a04b813))
- February dep bumps 🌲 ([7e2371f](https://github.com/agrc/deq-spills/commit/7e2371fc278afe01dc370aae3e0abd295cbc60f1))
- fix hanging ci tests ([dc4eaa5](https://github.com/agrc/deq-spills/commit/dc4eaa5813d57de43ee1783cf7cd618243766315))
- fix hanging jasmine tests ([0145aad](https://github.com/agrc/deq-spills/commit/0145aada41625be0339c6148c0824af470de1735))
- handle loading on different domains ([dc7be47](https://github.com/agrc/deq-spills/commit/dc7be47c8dcda2d5f0faa57a821e76c44dd36dcb))
- handle negative longitude values ([770691f](https://github.com/agrc/deq-spills/commit/770691f9c8e2a6380201f2924c4af416cc503500))
- local dev tweaks ([7c70d14](https://github.com/agrc/deq-spills/commit/7c70d14464b7d278b88d2140a0f91d0ed71702ab))
- more consistent build script name ([17538e3](https://github.com/agrc/deq-spills/commit/17538e322d446544f038a069abdecda7f6f44874))
- one more try on dev key ([b4f09bf](https://github.com/agrc/deq-spills/commit/b4f09bfdd5c203d2c50bd2bb02b9a046b054ba0e))
- remove superfluous quotes ([4d50093](https://github.com/agrc/deq-spills/commit/4d50093f13bd7c41136658300fff579948b5ec02))
- sort bower deps ([29e73b9](https://github.com/agrc/deq-spills/commit/29e73b96e55cebaa6ae62acd73ad14a1d7ae6d23))
- update api keys to match new DNS ([563cb3a](https://github.com/agrc/deq-spills/commit/563cb3a8d5f4a7b47ccf52db136976569dce1263))
- update key ([876bb65](https://github.com/agrc/deq-spills/commit/876bb65aaaf71627a5e644373df777052f1a43a2))
- upgrade to latest node version ([bd9a825](https://github.com/agrc/deq-spills/commit/bd9a825d91de3f9f4ad806da5254a789936182c7))
- use latest jasmine version ([11eff9f](https://github.com/agrc/deq-spills/commit/11eff9fab8c079991d0f85fd8c76c5ea46c02d3b))
