# Changelog

## 0.1.0 (2026-10-30)


### Features

* **api:** add api key authorisation betterAuth plugin ([#29](https://github.com/LucaMezz/quilt/issues/29)) ([9cfa9fe](https://github.com/LucaMezz/quilt/commit/9cfa9fe24d96c23f64976faf00ff9748d96de9d3))
* **api:** add app logo upload endpoint ([a7260b6](https://github.com/LucaMezz/quilt/commit/a7260b645c40ae5baa39e91c0b10165093526ab1))
* **api:** add create, destroy and list app endpoints ([a9909d6](https://github.com/LucaMezz/quilt/commit/a9909d6a0f3a5bbc60917279239514e0a74389b0))
* **api:** add organization logo upload endpoint ([43a4507](https://github.com/LucaMezz/quilt/commit/43a4507180445529da0d4f67f8aaa02abfedd914))
* **api:** add profile picture upload endpoint ([025fe9b](https://github.com/LucaMezz/quilt/commit/025fe9b19a38357c9336d510ae11c0acc94837e2))
* **api:** add user api key endpoints ([#34](https://github.com/LucaMezz/quilt/issues/34)) ([b76c3f1](https://github.com/LucaMezz/quilt/commit/b76c3f1d477e08b013bb03cd6f94c92484b04ffa))
* **api:** authenticate api requests with api keys ([#36](https://github.com/LucaMezz/quilt/issues/36)) ([717d099](https://github.com/LucaMezz/quilt/commit/717d099bc21ca96144570a20488c65ff0634fcac))
* **api:** document session auth and response schemas in OpenAPI spec ([e408481](https://github.com/LucaMezz/quilt/commit/e4084815b2573da90a88ea68573b6746ddd4c230))
* **api:** open organization, API key and user routes to API keys ([#92](https://github.com/LucaMezz/quilt/issues/92)) ([10b6fdc](https://github.com/LucaMezz/quilt/commit/10b6fdcce8fd6988c10173fd7c2b566ba8cfa4f5))
* **api:** scope apps to organizations ([5fff9c5](https://github.com/LucaMezz/quilt/commit/5fff9c505d9c2a6392615d1957ec685f1c981692))
* **auth:** add device authorization plugin ([#68](https://github.com/LucaMezz/quilt/issues/68)) ([6163fad](https://github.com/LucaMezz/quilt/commit/6163fad9b8f8cf741ead65c1b90cb3b90dc00282))
* **auth:** add organization plugin ([3f756be](https://github.com/LucaMezz/quilt/commit/3f756be22d62027ed4bb2a2c7f48060b4b46e5d6))
* **auth:** configure api key name, expiry and prefix limits ([#32](https://github.com/LucaMezz/quilt/issues/32)) ([b990a4b](https://github.com/LucaMezz/quilt/commit/b990a4b24a7820d0cd185a69728698ee9f5d5e40))
* **auth:** define API key resources and access levels ([#117](https://github.com/LucaMezz/quilt/issues/117)) ([ce88983](https://github.com/LucaMezz/quilt/commit/ce889838634b154d4296877ef7734f1ac2c6fcf6))
* **auth:** give the CLI an API key from the device flow ([#94](https://github.com/LucaMezz/quilt/issues/94)) ([a236a63](https://github.com/LucaMezz/quilt/commit/a236a637dd33d72eaba966f1b2964cf60469c351))
* **auth:** let API keys act for their owner on session endpoints ([#91](https://github.com/LucaMezz/quilt/issues/91)) ([1085ebf](https://github.com/LucaMezz/quilt/commit/1085ebf055ab9373da280edfb3d27ea70128b99f))
* **cli:** add branded help, status output and spinner ([163cae4](https://github.com/LucaMezz/quilt/commit/163cae4c8443c53df198f49538643767b822459f))
* **cli:** add quilt orgs list ([#104](https://github.com/LucaMezz/quilt/issues/104)) ([7cac6d1](https://github.com/LucaMezz/quilt/commit/7cac6d1c8a1e99feb76637c96191ce768aec2cfc))
* **cli:** add quilt orgs update and delete ([#110](https://github.com/LucaMezz/quilt/issues/110)) ([9a9129a](https://github.com/LucaMezz/quilt/commit/9a9129a31a6e7a2a895ca5d0430c9d0b5ccc2814))
* **cli:** authenticate with the API key from quilt login ([#95](https://github.com/LucaMezz/quilt/issues/95)) ([fc92885](https://github.com/LucaMezz/quilt/commit/fc92885f4e90614628a73bdc953063059e7f148e))
* **cli:** implement login device authorization flow ([#70](https://github.com/LucaMezz/quilt/issues/70)) ([362391c](https://github.com/LucaMezz/quilt/commit/362391cbfffe10c3b9350505d3c8fab9e457a0a4))
* **cli:** scaffold quilt CLI with health command ([240fa62](https://github.com/LucaMezz/quilt/commit/240fa6284a1145a031c5857e1a7233fa62628cba))
* **cli:** store access tokens in the OS keychain ([#88](https://github.com/LucaMezz/quilt/issues/88)) ([a8bf88a](https://github.com/LucaMezz/quilt/commit/a8bf88a93ce8408d3718bead0322b8194b799d77))
* **db:** add app, deployment and app secret tables ([693a696](https://github.com/LucaMezz/quilt/commit/693a696148208d0994e261a0acb549e89595d67f))
* **deploy:** add k3d demo cluster config ([ac4683c](https://github.com/LucaMezz/quilt/commit/ac4683c551ea954336fe9224762337463a82e9b0))
* **deploy:** install Knative Serving with Kourier on the demo cluster ([f2c6bed](https://github.com/LucaMezz/quilt/commit/f2c6bed7bc2d274ca22b95bd47a9d6f3a6bc9295))
* **docs:** add Fumadocs site with generated API reference ([48462aa](https://github.com/LucaMezz/quilt/commit/48462aa817e3c64c1f3abb917639850efef632e0))
* **docs:** generate CLI reference from command definitions ([56f98bd](https://github.com/LucaMezz/quilt/commit/56f98bd48e15ab277bcc47466f4dbf12e05a06cf))
* scaffold cluster package and controller app ([12c789c](https://github.com/LucaMezz/quilt/commit/12c789c8dc01075da5411e65dafb811b48ec9576))
* scaffold TypeScript API and web app ([3598490](https://github.com/LucaMezz/quilt/commit/35984900d3cb662f6dcc7cbdb62b650b4fda9aa8))
* **server:** connect to S3 storage ([87141bd](https://github.com/LucaMezz/quilt/commit/87141bdd6bc48af26fde28ef86976d794e3770ca))
* **storage:** add S3 storage client package ([303c6ed](https://github.com/LucaMezz/quilt/commit/303c6ed281dcd6bedfaa4db26e0a90f7941839d6))
* **ui:** add avatar, dialog, popover and other shadcn components ([#41](https://github.com/LucaMezz/quilt/issues/41)) ([69fdd41](https://github.com/LucaMezz/quilt/commit/69fdd413d41a1beb6a8b820d814c64f1590167cc))
* **ui:** apply emerald theme and load the inter font ([#45](https://github.com/LucaMezz/quilt/issues/45)) ([4f2be16](https://github.com/LucaMezz/quilt/commit/4f2be1643dca49e90b367399c842e3e84473bd68))
* **ui:** switch shadcn components to the base-mira style ([#46](https://github.com/LucaMezz/quilt/issues/46)) ([c18e350](https://github.com/LucaMezz/quilt/commit/c18e35011f5822fe27004cb2b8a6756dd7844884))
* **web:** add a settings page for your account ([#118](https://github.com/LucaMezz/quilt/issues/118)) ([a601cb3](https://github.com/LucaMezz/quilt/commit/a601cb3db4bd0d6e91b1005f76d63517a0880a5a))
* **web:** add device auth flow pages ([#65](https://github.com/LucaMezz/quilt/issues/65)) ([8aa0178](https://github.com/LucaMezz/quilt/commit/8aa0178e38acf536a0aad4de09369fbfd46666fd))
* **web:** add device authorization plugin to the auth client ([#73](https://github.com/LucaMezz/quilt/issues/73)) ([8a7c7eb](https://github.com/LucaMezz/quilt/commit/8a7c7eb1917665e532933bdda3c77bdad7c0222c))
* **web:** add langing page ([#47](https://github.com/LucaMezz/quilt/issues/47)) ([6a625e4](https://github.com/LucaMezz/quilt/commit/6a625e4a5d122e3539f39a6eb48d69ae8e9a1755))
* **web:** add sidebar app shell, dashboard page, marketing layout ([#57](https://github.com/LucaMezz/quilt/issues/57)) ([0285fc1](https://github.com/LucaMezz/quilt/commit/0285fc1249ac49b5afe6e3146ef8e483ee9f1a8f))
* **web:** connect the device page to the device authorization API ([#81](https://github.com/LucaMezz/quilt/issues/81)) ([911fce9](https://github.com/LucaMezz/quilt/commit/911fce938fbb66618a2219969e34f4c6dcd94b8a))
* **web:** list API keys in settings ([#119](https://github.com/LucaMezz/quilt/issues/119)) ([fe7426d](https://github.com/LucaMezz/quilt/commit/fe7426dfd29efbe8208b474c22a8656fda2beb4e))
* **web:** require login for /device and return there afterwards ([#80](https://github.com/LucaMezz/quilt/issues/80)) ([f223c55](https://github.com/LucaMezz/quilt/commit/f223c5519714745eb3ba5984f23685e313438822))
* **web:** return to a redirect target after login ([#75](https://github.com/LucaMezz/quilt/issues/75)) ([0dee1f6](https://github.com/LucaMezz/quilt/commit/0dee1f6c3b19c340107a0347ca14743aeb0a8758))
* **web:** use shadcn login and sign-up blocks ([#55](https://github.com/LucaMezz/quilt/issues/55)) ([3369065](https://github.com/LucaMezz/quilt/commit/336906505df0f0ce646b1ca82ddad6309c40f5bc))


### Bug Fixes

* **api:** return 409 when an app name is already taken ([#28](https://github.com/LucaMezz/quilt/issues/28)) ([74f09e2](https://github.com/LucaMezz/quilt/commit/74f09e214591cfeefac31a2af71fd466735e01c6))
* **auth:** point the device verification link at the web app ([#83](https://github.com/LucaMezz/quilt/issues/83)) ([37ae757](https://github.com/LucaMezz/quilt/commit/37ae757bd732da764fb589809bb417f4552a8424))
* **ci:** sign remote cache artifacts with the team ID ([#39](https://github.com/LucaMezz/quilt/issues/39)) ([2576530](https://github.com/LucaMezz/quilt/commit/2576530156b18371ba63d613bb146cc9406533c0))
* **infra:** use a distinctive local RustFS access key ([#82](https://github.com/LucaMezz/quilt/issues/82)) ([9d13d24](https://github.com/LucaMezz/quilt/commit/9d13d2461fa367949343feedb9ffbfe0df85e0f7))
* **infra:** wait for knative CRDs before applying serving core ([#30](https://github.com/LucaMezz/quilt/issues/30)) ([8b1f92c](https://github.com/LucaMezz/quilt/commit/8b1f92ccd8e2993e135d753066ddce0ef0a52714))
* restore per-package gitignores and untrack generated env files ([64af85c](https://github.com/LucaMezz/quilt/commit/64af85cd2825c07934283d52c3dbb4ecea515476))


### Documentation

* add CI and coverage badges to README ([dc9c84d](https://github.com/LucaMezz/quilt/commit/dc9c84d7366d223fcfc6f551916c51cad662bb11))
* add design notes index and draft resource model ([e5d7332](https://github.com/LucaMezz/quilt/commit/e5d733272f296655116a098a4d2fcd611994b6bc))
* document small, reviewable pull requests ([#16](https://github.com/LucaMezz/quilt/issues/16)) ([a62b70c](https://github.com/LucaMezz/quilt/commit/a62b70cfc2015c36123a650a35af7fdaf52a4000))
* remove design notes ([60090e9](https://github.com/LucaMezz/quilt/commit/60090e9c5cd05a651f08a38b37e563a4dbad623d))
* **repo:** add Scorecard badge and show the license in the README ([#24](https://github.com/LucaMezz/quilt/issues/24)) ([4c6573b](https://github.com/LucaMezz/quilt/commit/4c6573bad0e1bcc366f9c09adf23f98007c944e7))
* **repo:** add security policy ([#22](https://github.com/LucaMezz/quilt/issues/22)) ([ae071c4](https://github.com/LucaMezz/quilt/commit/ae071c46143c6b740d2c55eea07a72ba9207c9f3))
* **repo:** license under Apache-2.0 ([#23](https://github.com/LucaMezz/quilt/issues/23)) ([bcdfa08](https://github.com/LucaMezz/quilt/commit/bcdfa0835e9ada89675199c816308ab9b48836f9))
* update project structure in README ([76770e5](https://github.com/LucaMezz/quilt/commit/76770e50cd53e92c8a4caad9182cd6cea9c03ee5))
