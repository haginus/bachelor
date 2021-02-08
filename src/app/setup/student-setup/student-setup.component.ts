import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-student-setup',
  templateUrl: './student-setup.component.html',
  styleUrls: ['./student-setup.component.scss']
})
export class StudentSetupComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  validationForm = new FormGroup({
    'isValid': new FormControl(null, [Validators.requiredTrue])
  });

  topicsForm = new FormGroup({
    'selectedTopics': new FormControl(null, [Validators.required])
  });


  //mock data
  user : Student = {
    firstName: "Andrei",
    lastName: "Hagi",
    dateOfBirth: 934070400000,
    studies: {
      studyProgram: "Licență",
      domain: "Informatică",
      group: "331"
    }
  }

  topics : Topic[] = [
    {
      name: "Criptografie",
      id: 1
    },
    {
      name: "Tehnici de programare",
      id: 2
    },
    {
      name: "Aplicații web",
      id: 3
    },
    {
      name: "Aplicații distribuite",
      id: 4
    },
  ]

}

interface Student {
  firstName: string,
  lastName: string,
  dateOfBirth: number,
  studies: {
    studyProgram: string,
    domain: string,
    group: string
  }
}

interface Topic {
  name: string,
  id: number
}
