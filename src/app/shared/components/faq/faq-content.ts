// Static help content is extracted together with the rest of the Angular messages.
export const FAQ_CONTENT: Record<string, { question: string; answer: string }[]> = {
  student: [
    {
      question: $localize`De ce unii profesori nu apar în listă?`,
      answer: $localize`Profesorii cărora le puteți cere asocierea sunt scrict aceia care au oferte pentru domeniul dumneavoastră de studiu.
În cazul în care nu vedeți un profesor în lista completă, este posibil ca acesta să nu fi inclus oferte pentru domeniul la care studiați.`,
    },
    {
      question: $localize`Ce se întâmplă când un profesor îmi acceptă cererea?`,
      answer: $localize`În momentul în care un profesor vă acceptă cererea de asociere, restul cererilor pe care le-ați trimis se șterg și deveniți asociat cu acel profesor.
Veți vedea în meniul aplicației secțiunea „Lucrarea mea”, unde va fi nevoie să încărcați documentele necesare la înscrierea pentru susținerea lucrării dvs.`,
    },
    {
      question: $localize`Pot schimba profesorul coordonator dacă m-am răzgândit?`,
      answer: $localize`Da, însă această acțiune poate fi inițiată doar de către profesorul cu care v-ați asociat. Contactați-l pe acesta pentru a retrage asocierea cu dvs.`,
    },
    {
      question: $localize`De ce nu-mi pot edita lucrarea?`,
      answer: $localize`Va trebui să așteptați cel puțin 7 zile după ce profesorul coordonator v-a acceptat cererea de asociere pentru a vă edita lucrarea.
În cazul în care termenul de predare este mai aproape de 7 zile, veți putea edita lucrarea oricum.`,
    },
  ],
  teacher: [
    {
      question: $localize`Ce este și cum adaug o ofertă?`,
      answer: $localize`Ofertele reprezintă disponibilitatea dumneavoastră de a coordona noi lucrări. La adăugarea unei oferte, puteți selecta studenții cărora vă adresați prin alegerea domeniului. Fiecare ofertă trebuie să aibă cel puțin o temă (o etichetă generală a lucrărilor pe care vreți să le coordonați; ex. Aplicații web). Dacă sunteți în căutarea unor teme mai specifice, puteți folosi câmpul de descriere al ofertei. De asemena, puteți seta numărul de locuri limită pentru o anumită ofertă - odată atinsă limita, studenții nu mai poi aplica la acea ofertă.`,
    },
    {
      question: $localize`Cum adaug manual lucrări deja coordonate?`,
      answer: $localize`În cazul în care aveți deja o înțelegere cu un student care s-a concretizat în afara platformei, puteți adăuga lucrarea acestuia manual. În meniul „Lucrări coordonate” apăsați butonul „Adăugați o lucrare”. Va trebui să înscrieți titlul, descrierea și cel puțin o etichetă pentru lucrare. Mergând la pasul următor, va trebui să căutați și să alegeți studentul cu care sunteți asociat. În final veți vedea un ecran cu rezultatul, pe care îl puteți salva sau modifica întocându-vă la pașii anteriori.`,
    },
    {
      question: $localize`Ce înseamnă iconița ❗️ din dreptul lucrărilor coordonate?`,
      answer: $localize`Această iconiță apare în cazul în care aveți de încărcat documente pentru lucrarea respectivă (precum referatul profesorului coordonator). În momentul în care ați încărcat toate documentele, aceasta se va transforma în ✔️. Aceste două iconițe au mai mult rolul de vă ajuta să indentificați rapid lucrările pentru care încă nu ați încărcat documentele necesare.`,
    },
    {
      question: $localize`Ce se întâmplă în momentul în care accept o ofertă?`,
      answer: $localize`Odată ce acceptați o ofertă, se va crea o asociere între dumneavoastră și student sub forma unei lucrări.
Puteți accesa lucrarea în meniul „Lucrări coordonate”.`,
    },
    {
      question: $localize`Pot renunța la o lucrare cu un student?`,
      answer: $localize`Da, numai dvs. puteți efectua această acțiune.
Din meniu, selectați „Lucrări coordonate”, apăsați pe lucrarea la care care doriți să renunțați, apăsați pe iconița cu trei puncte și selectați „Rupeți asocierea”.
Studentul va putea apoi să își caute alt profesor.`,
    },
  ],
};
