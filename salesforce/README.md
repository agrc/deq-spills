# Spills Salesforce Lighting Web Component

## Development

Development Model: Org

Sandbox: <https://utahdeqorg--eid.sandbox.my.salesforce.com/>

Production: <https://utahdeqorg.lightning.force.com/>

### Setup

1. Install Salesforce CLI (`pnpm install -g @salesforce/cli`)
1. Install [Salesforce Extension Pack for VS Code](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)
1. Authorize Org Sandbox
    1. `org:login:web --alias utahdeqorg --instance-url https://utahdeqorg--eid.sandbox.my.salesforce.com/ --set-default`

### Pulling Changes from Org

`sf project retrieve start --source-dir force-app`

### Pushing Changes to Org

`sf project deploy start --source-dir force-app`

## References

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
