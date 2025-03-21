export interface Person {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
  }
  
  export interface Patient {
    person: Person;
  }
  