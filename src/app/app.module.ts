import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatInputModule} from '@angular/material/input'
import {MatIconModule} from '@angular/material/icon'; 
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { DialogComponent } from './dialog/dialog.component'; 
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatDividerModule} from '@angular/material/divider'; 
@NgModule({
  declarations: [
    AppComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatDividerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
