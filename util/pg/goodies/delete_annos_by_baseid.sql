DELETE FROM anno_data WHERE (versid).baseid IN (
  "3b1d09ba-4c1f-4708-b6d1-38d445a1b17a",
  "f33216f2-3133-43eb-acfa-d3f215dde2fa",
  "");

DELETE FROM anno_links WHERE versid NOT IN (SELECT versid FROM anno_data);
DELETE FROM anno_stamps WHERE versid NOT IN (SELECT versid FROM anno_data);


-- -*- coding: UTF-8, tab-width: 2 -*-
