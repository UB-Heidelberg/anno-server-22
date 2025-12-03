WITH svg_selectors AS (
  SELECT versid, (versid).baseid, (versid).vernum,
    (tgt_num - 1) AS idx,
    tgt_obj->'selector'->>'value' AS sel,
    (tgt_obj - 'selector') AS tgt,
    (details::jsonb - 'target' - 'body') AS meta,
    -- details->>'body' AS bodies,
    ('https://anno.ub.uni-heidelberg.de/anno/' ||
      (versid).baseid || '~' || (versid).vernum) AS url
  FROM anno_data CROSS JOIN LATERAL jsonb_path_query(
    (details->'target')::jsonb, '$[*] ? (@.selector.type == "SvgSelector")',
    '{}'::jsonb) WITH ORDINALITY AS tmp_results(tgt_obj, tgt_num)
  )
SELECT url, idx, sel FROM svg_selectors WHERE true
  AND (versid).baseid = 'cb4d76aa-aec9-4668-9bae-6dc012caa1ab'
  AND (versid).vernum = 15
ORDER BY versid ASC, idx ASC
LIMIT 100;


-- -*- coding: UTF-8, tab-width: 2 -*-
