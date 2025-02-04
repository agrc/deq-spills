# DEQ Spills Web Application & Salesforce Integration

This projects consists of two parts:

- Firebase web mapping application
- Salesforce Lightning Component

## Firebase

This web site is embedded via iframe in several DEQ web applications. See [src/index.html](src/index.html) for an example of how this is done.

Staging: <https://deqspills.dev.utah.gov/>

Production: <https://deqspills.deq.utah.gov/>

## Salesforce

This project also contains a Salesforce Lightning Component ([/salesforce](/salesforce/)) that embeds the Firebase web application via iframe in a similar way to other DEQ web applications.

Development Sandbox: <https://utahdeqorg--eid.sandbox.my.salesforce.com/>

Production Salesforce Instance: <https://utahdeqorg.lightning.force.com/>

## Development

>[!NOTE]
>For DEQ web developers developing on `localhost`: You need to define the following global variable and pass a wide-open quad word: `AGRC_testQuadWord`.

### Firebase

Pushes to `dev` and `main` branches will automatically deploy to staging and production Firebase instance respectively using the standard UGRC release and deploy actions.

### Salesforce

The Salesforce Lightning Component is developed in the `/salesforce` directory. The component is built using the [Salesforce Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/en/lwc) framework.

#### Setup

1. Install the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli)
1. Authenticate with the DEQ Salesforce org: `sfdx org login web --instance-url https://utahdeqorg--eid.sandbox.my.salesforce.com/ --alias spillsSandbox`
1. Right-click on `manifest/package.xml` and select `SFDX: Retrieve Source in Manifest from Org`

#### Deploy To Sandbox

1. Right-click on `lwc` folder and select `SFDX: Deploy Source to Org`
1. Go to a case record in the sandbox (e.g. <https://utahdeqorg--eid.sandbox.lightning.force.com/lightning/r/Case/5003R000007Vao4QAC/view>)
1. Click the gear icon in the upper right corner and select `Edit Page`
1. Click on the "Save" button and then go back to the page (this is a hack to make sure that salesforce gets your changes).

#### Deploy To Production

1. Setup Cog button -> Setup
1. Quick Find -> Outbound Change Sets
1. Create a new set and add the component(s) that you want to deploy
1. Upload the change set and then ask Barry to deploy your change set to production.
