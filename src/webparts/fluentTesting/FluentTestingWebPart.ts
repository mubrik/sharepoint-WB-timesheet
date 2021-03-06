import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'FluentTestingWebPartStrings';
import MainPage, {IMainProps} from './components/FluentTesting';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import requestServer from "./controller/server";

export interface IFluentTestingWebPartProps {
  description: string;
}

export default class FluentTestingWebPart extends BaseClientSideWebPart<IFluentTestingWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IMainProps> = React.createElement(
      MainPage,
      {
        description: this.properties.description,
        context: this.context,
        request: new requestServer(this.context)
      }
    );

    ReactDom.render(element, this.domElement);
  }

  public async onInit (): Promise<void> {

    return super.onInit().then(_ => {

      // other init code may be present

      sp.setup({
        spfxContext: this.context
      });

      console.log("initialiabs");
    });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
