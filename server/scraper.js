import request from 'request';
import cheerio from 'cheerio';
import { men_src_urls, women_src_urls } from './constants/urls'
import { getSchoolNames, createYearMapping } from './helpers'

const mens_meets_by_year = createYearMapping(men_src_urls);
const women_meets_by_year = createYearMapping(women_src_urls);

console.log(mens_meets_by_year);
console.log(women_meets_by_year);