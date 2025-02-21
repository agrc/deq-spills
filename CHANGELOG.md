# Changelog

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
