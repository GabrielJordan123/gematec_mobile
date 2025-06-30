export default class LoginRequest {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  toJSON(): { email: string; password: string } {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
