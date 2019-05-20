import { Component, ElementRef, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { UserService } from '../../../services/user.service';
import { Role } from '../../../models/role/role';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../models/user/user';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
//clear form
export class EditUserComponent implements OnInit {
  @ViewChild('close') closeEditModal: ElementRef;
  @Output() updateUser = new EventEmitter<User>();
  @Input() set user(user: User) {
    if (!user) {
      return;
    }
    this.userForm.patchValue({ ...user, role: user.role.transName });
    this.selectedUser = user;
  }
  selectedUser = new User();
  userForm: FormGroup;
  roles: Role[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private serviceRole: RoleService,
    private serviceUser: UserService,
    private toast: ToastrService
  ) {}

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      id: '',
      lastName: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern("^[A-Za-zА-Яа-яїієЇІЯЄ/'/`-]+[A-Za-zА-Яа-яїієЇІЯЄ]$")
        ])
      ),
      firstName: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern("^[A-Za-zА-Яа-яїієЇІЯЄ/'/`-]+[A-Za-zА-Яа-яїієЇІЯЄ]$")
        ])
      ),
      middleName: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern("^[A-Za-zА-Яа-яїієЇІЯЄ/'/`-]+[A-Za-zА-Яа-яїієЇІЯЄ]$")
        ])
      ),
      phoneNumber: new FormControl('', Validators.minLength(12)),
      email: new FormControl('', Validators.compose([Validators.email, Validators.maxLength(30)])),
      role: ['', Validators.required],
      isActive: true
    });
    this.serviceRole
      .getEntities()
      .subscribe(data => (this.roles = data.sort((a, b) => a.transName.localeCompare(b.transName))));
  }

  updateData() {
    if (this.userForm.invalid) {
      return;
    }

    this.closeEditModal.nativeElement.click();
    const form = this.userForm.value;
    const user: User = new User({
      id: form.id,
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName,
      phoneNumber: form.phoneNumber,
      login: this.selectedUser.login,
      email: form.email,
      role: this.roles.find(r => r.transName === form.role),
      isActive: form.isActive
    });
    this.serviceUser.updateEntity(user).subscribe(
      _ => {
        this.updateUser.next(user);
        this.toast.success('', 'Користувача змінено');
      },
      error => this.toast.error('Помилка', 'Користувач з таким логіном існує')
    );
  }
  updateUserChangeActive(user: User) {
    this.updateUser.next(user);
  }
}
function resetForm() {
  $('#editUser')
    .find('form')
    .trigger('reset');
}
