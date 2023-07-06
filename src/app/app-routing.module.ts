import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  
  // { 
  //   path: 'auth',
  //   loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) 
  // },
  // { 
  //   path: '**', redirectTo: '/' 
  // }
  {
    path: 'public', loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  },
  { 
    path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'user',loadChildren: () => import('./private/private.module').then(m => m.PrivateModule)
  },
  // { path: '', redirectTo: '/user/estadisticas', pathMatch: 'full'},
  { path: '', redirectTo: '/public/home', pathMatch: 'full'},
  {
    path: '**',redirectTo: 'public'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    useHash: true, 
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
