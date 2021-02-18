import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class AdminStudentsComponent implements OnInit, AfterViewInit {


  ngOnInit(): void {
  }

  displayedColumns: string[] = ['id', 'lastName', 'firstName', 'domain', 'group', 'email', 'actions'];
  dataSource: MatTableDataSource<Student>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    const users: Student[] = [
      { id: 1, firstName: "Andrei", lastName: "Hagi", email: "hagiandrei.ah@gmail.com", group: "331", domain: {domainId: 1, name: "Informatică", type: "bachelor"} },
      { id: 2, firstName: "Alex", lastName: "Dra", email: "ah@gmail.com", group: "331", domain: {domainId: 1, name: "Biostatică", type: "master"} },
      { id: 3, firstName: "Andrei", lastName: "Hagi", email: "hagiandrei.ah@gmail.com", group: "331", domain: {domainId: 1, name: "Informatică", type: "bachelor"} }

    ]

    this.dataSource = new MatTableDataSource(users);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

export interface Student {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  group: string,
  domain: {
    domainId: number,
    name: string,
    type: "bachelor" | "master"
  }

}
