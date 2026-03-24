import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PoPageLoginModule } from '@po-ui/ng-templates';
import { PoNotificationService } from '@po-ui/ng-components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PoPageLoginModule],
  templateUrl: './login.html',
})
export class Login {
  constructor(private router: Router, private poNotification: PoNotificationService) {}

  onLogin(formData: any) {
    if (formData.login === 'admin' && formData.password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      this.poNotification.success('Login efetuado com sucesso!');
      this.router.navigate(['/']);
    } else {
      this.poNotification.error('Usuário ou senha inválidos!');
    }
  }
}
