using {library as my} from '../db/data-model';

service fetchBooks {
    entity books as projection on my.books;
}
