import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PoPageLoginModule } from '@po-ui/ng-templates';
import { PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PoPageLoginModule],
  templateUrl: './login.html',
})
export class Login {
  constructor(private router: Router, private poNotification: PoNotificationService, private authService: AuthService) {}

  onLogin(formData: any) {
    const login = formData.login?.toLowerCase();
    const password = formData.password;

    console.log('Tentativa de login:', { login, password });

    this.authService.login(login, password).subscribe({
      next: () => {
        this.poNotification.success('Login efetuado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        const errorMsg = err.status === 0 
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.' 
          : (err.error?.message || 'Usuário ou senha inválidos!');
        this.poNotification.error(errorMsg);
      }
    });
  }
}
