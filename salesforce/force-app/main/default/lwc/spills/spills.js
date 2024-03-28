import { updateRecord, getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, wire, api } from 'lwc';
import ID_FIELD from '@salesforce/schema/Case.Id';
import ADDRESS from '@salesforce/schema/Case.Address_Location__c'
import CITY from '@salesforce/schema/Case.Nearest_Town_City__c';
import COUNTY from '@salesforce/schema/Case.County__c';
import DD_LAT from '@salesforce/schema/Case.Latitude__c';
import DD_LONG from '@salesforce/schema/Case.Longitude__c';
import HIGHWAY from '@salesforce/schema/Case.Highway__c';
import INDIAN from '@salesforce/schema/Case.Indian_Land__c';
import MILEMARKER from '@salesforce/schema/Case.Mile_Marker__c';
import OWNER_AGENCY from '@salesforce/schema/Case.Land_Ownership__c';
import UTM_X from '@salesforce/schema/Case.Utm_E_X_6_dgts__c';
import UTM_Y from '@salesforce/schema/Case.Utm_N_Y_7_dgts__c';

export default class Spills extends LightningElement {
    utm_x;
    utm_y;
    @api recordId;
    @api isSandbox;

    @wire(getRecord, { recordId: '$recordId', fields: [ID_FIELD, UTM_X, UTM_Y] })
    wiredRecord({ error, data}) {
        if (error) {
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map((e) => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading contact',
                    message,
                    variant: 'error'
                })
            );
        } else if (data) {
            console.log('wc(spills): wiredRecord data', data);
            this.utm_x = data.fields[UTM_X.fieldApiName].value;
            this.utm_y = data.fields[UTM_Y.fieldApiName].value;
        }
    }

    get iframeSrc() {
        console.log('wc(spills): isSandbox', this.isSandbox)
        if (this.isSandbox) {
            return 'https://deqspills.dev.utah.gov'; // staging
        } else if (this.isSandbox === false) {
            return 'https://deqspills.ugrc.utah.gov'; // prod
        }

        return null;
    }

    constructor() {
        console.log('wc(spills): constructor', window);

        super();
    }

    connectedCallback() {
        console.log('wc(spills): connectedCallback')
        window.addEventListener('message', this.receiveMessage);
    }

    disconnectedCallback() {
        window.removeEventListener('message', this.receiveMessage);
    }

    receiveMessage = (event) => {
        console.log('wc(spills): event from iframe:', event);

        if (event.origin !== this.iframeSrc) {
            console.warn(`wc: received message from unknown origin: ${event.origin}`);
            return;
        }

        const { data } = event;
        console.log('wc(spills): data from iframe:', data);

        if (!data.UTM_X) {
            return;
        }
        const utmX = Math.round(data.UTM_X);
        const utmY = Math.round(data.UTM_Y);

        if (utmX === this.utm_x && utmY === this.utm_y) {
            console.log('wc(spills): no change in UTM_X or UTM_Y');
            return;
        }

        const fields = {
            [ID_FIELD.fieldApiName]: this.recordId,
            [ADDRESS.fieldApiName]: `${data.ADDRESS}, ${data.ZIP}`, // comes from widget text inputs
            [CITY.fieldApiName]: data.CITY,
            [COUNTY.fieldApiName]: data.COUNTY,
            [DD_LAT.fieldApiName]: data.DD_LAT.toString(),
            [DD_LONG.fieldApiName]: data.DD_LONG.toString(),
            [HIGHWAY.fieldApiName]: data.HIGHWAY, // comes from widget text input
            [INDIAN.fieldApiName]: data.INDIAN,
            [MILEMARKER.fieldApiName]: data.MILEMARKER, // comes from widget text input
            [OWNER_AGENCY.fieldApiName]: data.OWNER_AGENCY,
            [UTM_X.fieldApiName]: utmX.toString(),
            [UTM_Y.fieldApiName]: utmY.toString()
        }

        console.log(JSON.stringify(fields));

        updateRecord({fields}).then(() => {
            console.log('record updating');
            console.log('wc(spills): record updated successfully');

        }).catch(error => {
            console.log(JSON.stringify(error));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    renderedCallback() {
        console.log('wc(spills): renderedCallback');

        this.refs.iframe.addEventListener('load', () => {
            console.log('wc(spills): iframe loaded', this.utm_x, this.utm_y);

            this.refs.iframe.contentWindow.postMessage({
                UTM_X: this.utm_x,
                UTM_Y: this.utm_y,
                targetOrigin: window.document.location.origin
            }, this.iframeSrc);
        });
    }
}
