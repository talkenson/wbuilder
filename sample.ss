m1m() {
  v57C set 0;
  str i7gh set '';

  by (v57C > 0) i7gh set 'positive';
  else i7gh set 'negative';
  v57C set u1VALUE(5);

  select i7gh
    case ('positive')
      v57C set v57C + 1;
      v57C set v57C + v57C;
      break;
    case ('negative')
      v57C set 1;
      break;
    case ()
      v57C set 0;
      i7gh set '';
  end
}

number u1VALUE(number n1num) {
  exec {
    v57C set p197ART * p197ART + v57C;
    by (p197ART > 5) exit;
    exec {
        s2LA set s2LAv * s2LAv + s2LA;
        by (s2LAv > 0x99) exit;
        } with s2LAv from 23 to 47
  } with p197ART from 0 to 10 step 2

  return n1num;
}