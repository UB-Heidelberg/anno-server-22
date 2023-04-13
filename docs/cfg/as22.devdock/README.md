﻿
Example DevDock project
=======================


How to install
--------------

1.  We assume you already have the correct DevDock version installed.
    If you're unsure, refer to the main install instructions.
1.  Open a shell for the anno server user in the DevDock project directory.
    It's probably where this here README resides. It contains a `dock.sh`.
    If the path to here contains `docs/cfg/`, you may have missed a copy step.
    Edit your local copy instead.
1.  Adjust the config files in `config/`.
    The most important places are marked with `:maybe_customize:`,
    so you can easily find them with<br>
    `git grep -A 1 -nFe :maybe_customize:`<br>
    and remove the markers from the settings you've dealt with.
1.  Create the initial password files:
    In the project directory, run `./secrets/make_random_passwords.sh`
    * Alternatively, you may configure them manually according to
      the hints in [secrets/.gitignore](secrets/.gitignore).
1.  If you would like to use a Web GUI to manage Postgres,
    `ln --symbolic --target-directory=enabled -- ../avail/pgadminer.yaml`
    * If your shell completion lacks support for `--target-directory=`,
      you may want to first omit `../`, complete the path, then insert `../`.
1.  Start the DevDock project's container group. (See [the DevDock readme
    ](https://github.com/mk-pmb/docker-devel-util-pmb/tree/master/devdock)
    for how.)
    * When you start the project for the first time,
      the database is not yet initialized, so a lot of features are not
      available yet. We'll fix that later.
    * There should be some Postgres messages about first time startup
      preparations. This should complete within a few minutes.
    * Meanwhile there may be failure messages from the anno server about
      Postgres not responding.
    * When Postgres is ready, the anno server should (re)start automatically
      and print `Now listening.`
      This means it's time to inizialize the database.
1.  Inizialize the database.
    1.  The installation script should have generated a file
        `<anno-server-22 repo path>/util/pg/dbinit_structure.sql`.
        One of the first few lines should be the date of generation.
        (NB: The file was created inside Docker, and Docker might use
        a different time zone than the host.)
        Verify that it matches the time when you installed the server,
        i.e. probably not older than a few minutes.
    1.  Import that file into your database (see below for how).
        It should remove all existing data.
        Which shouldn't matter because in a new install,
        there should not be any previous data.
1.  The docker project is configured for automatic startup.
    Verify this by rebooting your server
    (the "outer" one, that runs the docker daemon)
    and then checking if the anno server is accessible through Apache.




How to control the docker container group
-----------------------------------------

See [the DevDock readme
](https://github.com/mk-pmb/docker-devel-util-pmb/tree/master/devdock).




How to interact with the database
---------------------------------


### Using docker

* Run `docker ps` to determine the name of your Postgres container.
  Usually, it's your DevDock project name + `_postgres_1`.
  For this guide we will assume it's `as22_postgres_1`.
* The `util/pg/` directory of anno-server-22 is mounted into the Postgres
  container as `/asu`, acronym for "anno-server's utilities".
* To get an interactive `psql` (Postgres command line) session:
  `docker exec --tty --interactive as22_postgres_1 /asu/psql`
* To run a single command, e.g. to test whether the database is alive:
  `docker exec as22_postgres_1 /asu/c 'SELECT NOW();'`
* To import an SQL file from the `util/pg/` folder, e.g. the database
  initialization file (see warnings above):
  `docker exec as22_postgres_1 /asu/f dbinit_structure.sql`
* To dump the entire anno database for backup:
  initialization file (see warnings above):
  `docker exec as22_postgres_1 /asu/export`
  * It's basically `pg_dump` with some recommended default options.
    If you want `pg_dump` with only mandatory options applied,
    you can use `/asu/pg_dump`.
    * This might be useful if you want to also export the table structure,
      probably in case you have customized it beyond what was created by
      the database initialization file.




### Using pgAdminer

* Navigate your browser to the public URL of your Adminer.
  If you have configured a public IP address in the `adminer_dkport` setting,
  it might be directly accessible; otherwise, you'll need to configure your
  firewall, a tunnel and/or `mod_proxy` to gain access.
* In the login form, select database type "Postgres". Unfortunately, we have
  not yet found a way to make the login form pre-select this by default.
  * One way of explicitly selecting the database type is to set the
    URL query part to `?pgsql=postgres`. You can use this for bookmarks.
* As the password, enter the Postgres password as configured in `secrets/`.
  All other fields should have the coorect values by default. Click "Login".
* Explore a bit on your own.
  For more guidance, see [the Adminer website](https://www.adminer.org/).








