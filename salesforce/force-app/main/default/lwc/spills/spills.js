import { updateRecord, getRecord } from 'lightning/uiRecordApi';
import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ID_FIELD from "@salesforce/schema/Case.Id";
import ADDRESS from '@salesforce/schema/Case.Address_Location__c'
import CITY from '@salesforce/schema/Case.Nearest_Town_City__c';
import COUNTY from '@salesforce/schema/Case.County__c';
import HIGHWAY from '@salesforce/schema/Case.Highway__c';
import INDIAN from '@salesforce/schema/Case.Indian_Land__c';
import MILEMARKER from '@salesforce/schema/Case.Mile_Marker__c';
import OWNER_AGENCY from '@salesforce/schema/Case.Land_Ownership__c';
import UTM_X from '@salesforce/schema/Case.Utm_E_X_6_dgts__c';
import UTM_Y from '@salesforce/schema/Case.Utm_N_Y_7_dgts__c';

export default class Spills extends LightningElement {
  @api recordId; // special prop that is automatically set from the current record
  utm_x;
  utm_y;

  // TODO: figure out how to manage these different environment variables...
  iframeSrc = 'https://deqspills.dev.utah.gov'; // staging
  // iframeSrc = 'https://deqspills.ugrc.utah.gov'; // prod

  @wire(getRecord, { recordId: '$recordId', fields: [ID_FIELD, UTM_X, UTM_Y] })
  wiredRecord({ error, data}) {
    if (error) {
      let message = "Unknown error";
      if (Array.isArray(error.body)) {
        message = error.body.map((e) => e.message).join(", ");
      } else if (typeof error.body.message === "string") {
        message = error.body.message;
      }
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error loading contact",
          message,
          variant: "error",
        }),
      );
    } else if (data) {
      console.log('wc: wireRecord data', data);

      this.utm_x = data.fields[UTM_X.fieldApiName].value;
      this.utm_y = data.fields[UTM_Y.fieldApiName].value;
    }
  }

  constructor() {
    console.log('wc: constructor');

    super();
  }

  connectedCallback() {
    window.addEventListener('message', this.receiveMessage);
  }

  disconnectedCallback() {
    window.removeEventListener('message', this.receiveMessage);
  }

  receiveMessage = (event) => {
    console.log('wc: event from iframe:', event);

    if (event.origin !== this.iframeSrc) {
      console.warn(`wc: received message from unknown origin: ${event.origin}`);
      return;
    }

    const { data } = event;
    console.log('wc: data from iframe:');
    console.table(data);

    if (!data.UTM_X) return;
    const utmX = Math.round(data.UTM_X);
    const utmY = Math.round(data.UTM_Y);

    console.log(`wc: utmX ${utmX}, utmY ${utmY}, this.utm_x ${this.utm_x}, this.utm_y ${this.utm_y}`);
    if (utmX === this.utm_x && utmY === this.utm_y) {
      console.log('wc: no change in UTM_X or UTM_Y');
      return;
    }

    const fields = {
      [ID_FIELD.fieldApiName]: this.recordId,
      [ADDRESS.fieldApiName]: `${data.ADDRESS}, ${data.ZIP}`, // comes from widget text inputs
      [CITY.fieldApiName]: data.CITY,
      [COUNTY.fieldApiName]: data.COUNTY,
      [HIGHWAY.fieldApiName]: data.HIGHWAY, // comes from widget text input
      [INDIAN.fieldApiName]: data.INDIAN,
      [MILEMARKER.fieldApiName]: data.MILEMARKER, // comes from widget text input
      [OWNER_AGENCY.fieldApiName]: data.OWNER_AGENCY,
      [UTM_X.fieldApiName]: utmX,
      [UTM_Y.fieldApiName]: utmY,
    }

    updateRecord({fields}).then(() => {
      console.log('wc: record updated successfully');
    }).catch(error => {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error updating record',
          message: error.body.message,
          variant: 'error',
        })
      );
    });
  }

  renderedCallback() {
    console.log('wc: renderedCallback');

    this.refs.iframe.addEventListener('load', () => {
      console.log('wc: iframe loaded');

      this.refs.iframe.contentWindow.postMessage({
        UTM_X: this.utm_x,
        UTM_Y: this.utm_y,
        targetOrigin: window.document.location.origin,
      }, this.iframeSrc);
    });
  }
}