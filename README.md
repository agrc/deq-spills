# DEQ Spills Web Application & Salesforce Integration

This project consists of three separate projects:

## Firebase Web App (`website`)

Staging: <https://spillsmap.dev.utah.gov/>

Production: <https://spillsmap.deq.utah.gov/>

This is a normal web application hosted in firebase. It is used in two different contexts:

### Standalone

When used as a standalone website, data is passed via Url parameters. This is used for linking from the public search results page as well as the lead agency report emails.

### Embedded

When used as an embedded application, data is passed (both ways) via the `window.postMessage` API. This is used in the DEQ Salesforce Lightning Component. A Url parameter (embedded=true) is used to indicate that the application is being used in an embedded context.

The following pages can be used to test the different embedded contexts:

- `tests/duty-officer.html`
- `tests/lead-agency-report.html`

### Url Parameters

| Parameter  | Description                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| `embedded` | Set to true if the application is being used in an embedded context. This hides the header and footer among other things. |
| `readonly` | Set to true to hide the location editing controls and disable location updates via map clicks.                            |
| `flowpath` | Set to true to enable the flow path calculations and controls                                                             |

Additionally, when in standalone mode, any of the properties of [`DataContextType['data']`](website/src/contexts/DataProvider.tsx) can be passed as Url parameters. These show up in a sidebar.

### Deployment

Pushes to `dev` and `main` branches will automatically deploy to staging and production Firebase instance respectively using the standard UGRC release and deploy actions.

## Salesforce Lightning Web Component (`salesforce`)

This project consists of a [Salesforce Lightning Web Component](https://developer.salesforce.com/docs/component-library/documentation/en/lwc) that embeds the Firebase web application via an iframe. It also includes a simple `environmentSwitch` component that allows us to switch between the production and development Urls in the iframe.

Development Sandbox: <https://utahdeqorg--eid.sandbox.my.salesforce.com/>

Production Salesforce Instance: <https://utahdeqorg.lightning.force.com/>

Development Model: Org

### Setup

1. Install Salesforce CLI (`pnpm install -g @salesforce/cli`)
1. Install [Salesforce Extension Pack for VS Code](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)
1. Authorize Org Sandbox
   1. `org:login:web --alias utahdeqorg --instance-url https://utahdeqorg--eid.sandbox.my.salesforce.com/ --set-default`

### Pulling Changes from Org

From `salesforce` directory:

`sf project retrieve start --source-dir force-app`

### Pushing Changes to Org

From `salesforce` directory:

`sf project deploy start --source-dir force-app`

#### Testing Lead Agency Form

1. Log into sandbox.
1. Contacts -> Nathan Hall
1. "Log in to Experience as User" -> "DEQ EID Portal Authorized Users"
1. "Spill Reports" -> Select a report

### References

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)

## Legacy Firebase Web App (`legacy`)

This is the legacy version of the web application that is still used by the Tanks system. They are currently working on migrating Tanks to Salesforce after which this application will be deprecated.

This application has been removed from CI so any new deployments would need to be done manually.

Staging: <https://deqspills.dev.utah.gov/>

Production: <https://deqspills.ugrc.utah.gov/>
