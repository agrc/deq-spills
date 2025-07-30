import getSandboxFlag from "@salesforce/apex/CheckIfSandbox.getSandboxFlag";
import { LightningElement, wire, api, track } from "lwc";

export default class EnvironmentSwitch extends LightningElement {
  @api recordId; // special prop that is automatically set from the current record
  isValueLoaded = false;
  @track isSandbox = false;
  instanceId;

  @wire(getSandboxFlag)
  wiredSandboxFlag({ error, data }) {
    if (error) {
      console.error("wc(switch): error getting sandbox flag", error);
    } else if (data) {
      console.log("wc(switch): wiredSandboxFlag data", data);
      this.isSandbox = data;
    }
    this.isValueLoaded = true;
    this.instanceId = crypto.randomUUID();
    console.log("sandbox " + this.isSandbox);
  }

  constructor() {
    console.log("wc(switch): constructor", window);

    super();
  }
}
