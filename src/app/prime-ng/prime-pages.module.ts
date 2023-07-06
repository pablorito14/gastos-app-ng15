import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenubarModule } from 'primeng/menubar';
import { ScrollTopModule } from 'primeng/scrolltop';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ChartModule } from 'primeng/chart';
// import {ColorPickerModule} from 'primeng/colorpicker';
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from "primeng/keyfilter";
import { DialogModule } from 'primeng/dialog';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ConfirmationService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { AutoFocusModule } from 'primeng/autofocus';
import { InputNumberModule } from 'primeng/inputnumber';
import {SliderModule} from 'primeng/slider';
import { AccordionModule } from 'primeng/accordion';
import { SelectButtonModule } from 'primeng/selectbutton';


import {SidebarModule} from 'primeng/sidebar';

/** NO PRIMENG */
// import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  exports: [
    AccordionModule,
    AutoFocusModule,
    BlockUIModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    ChipModule,
    ChartModule,
    // ColorPickerModule,
    ConfirmPopupModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    InputMaskModule,
    InputTextModule,
    KeyFilterModule,
    MenubarModule,
    ProgressSpinnerModule,
    RippleModule,
    SelectButtonModule,
    SliderModule,
    ScrollTopModule,
    TableModule,

    SidebarModule
  ],
  providers: [
    ConfirmationService
  ]
})
export class PrimePagesModule { }
