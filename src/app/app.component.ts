import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IpcRenderer } from 'electron';
import { DialogComponent } from './dialog/dialog.component';
declare const ipcRenderer: IpcRenderer;
import { OrderBy, SizeType, Config,Res } from '../../electron/process'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private dialog: MatDialog) {

  }
  path: string = '';
  subFiles: number | null = null;
  subSize: number | null = null;
  subSizeType: SizeType = 'GB';
  orderBy: OrderBy = 'name';
  loading: boolean = false;
  selectDirectory() {
    ipcRenderer.invoke('selectDirectory').then((value: string) => {
      if (value)
        this.path = value;

    })
  }


  run(): void {
    
    if (!this.path) {
      this.dialog.open(DialogComponent, { data: { title: { text: 'Invalid Configuration!', color: "var(--bs-danger)" }, content: 'Path should be provided.' } })
      return;
    }
    if ((!this.subFiles && !this.subSize) || (this.subFiles == 0 && this.subSize)) {
      this.dialog.open(DialogComponent, { data: { title: { text: 'Invalid Configuration!', color: 'var(--bs-danger)' }, content: 'Max number of files or/and size of each subfolder should be specified.' } })
      return;
    }
    var e = 'Invalid Configuration!'
    if (this.subFiles && this.subFiles < 0) {
      this.dialog.open(DialogComponent, { data: { title: { text: 'Invalid Configuration!', color: 'var(--bs-danger)' }, content: 'Max number of files should be empty or positive integer.' } })
      return;
    }
    if (this.subSize && this.subSize < 0) {
      this.dialog.open(DialogComponent, { data: { title: { text: 'Invalid Configuration!', color: "var(--bs-danger)" }, content: 'Size of subfolder should be empty or positive integer.' } })
      return;
    }
    this.loading = true;
    let size = 0;
    if (this.subSize)
      size = this.subSizeTypeToBytes(this.subSize);
    let config: Config = {
      path: this.path,
      subFiles: this.subFiles ?? 0,
      subSize: size,
      orderBy: this.orderBy
    }

    ipcRenderer.invoke('filesSplitter', config)
      .then((v: Res) => {
        if (v.success == false)
          this.dialog.open(DialogComponent, { data: { title: { text: 'Error!', color: 'var(--bs-danger)' }, content: v.message } });
        else this.dialog.open(DialogComponent, { data: { title: { text: 'Successfully Done', color: 'var(--bs-success)' }, content: v.message } })
        this.loading = false;
      })


  }
  /**
   * using subSizeType to convert size to bytes
   * @param size number as GB, MB, or KB
   * @returns size in Byte
   */
  subSizeTypeToBytes(size: number): number {
    const type = {
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };

    return size * type[this.subSizeType];
  }
}
