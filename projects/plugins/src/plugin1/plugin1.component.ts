import { Component, OnInit } from '@angular/core';
import { MdmResourcesService } from 'mdm-resources';
import { MdmResourcesConfiguration } from '@maurodatamapper/mdm-resources';
import { MdmRestHandlerService } from 'mdm-resources';
import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';



@Component({
  selector: 'app-plugin1',
  templateUrl: './plugin1.component.html',
  styles: [
  ]
})
export class Plugin1Component implements OnInit {

  constructor(private rc: MdmResourcesService) { }

  ngOnInit(): void {
  
  }

}
