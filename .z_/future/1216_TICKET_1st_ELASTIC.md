# First Elastic Search Ticket

I just set up an elasticsearch docker container, seems to be running OK. 

I have some setup information on this written to .z_/future/_ELASTIC_SETUP.md

My usage of this instance will be primarily as a vector db for AI queries, but it will not be limited to this usage.

But first I need to get it loaded up with a batch of documents so i can have something to iterate over and learn from. That is the primary objective of this ticket.

Please set up a python script in tools/ that reads the files from `../daily/batch/` and installs the contents of each file into elasticsearch for later indexing and running vector db queries against.

The rules of working in this monorepo are rather strict, but most of these rules will not apply to the work of this ticket, as this ticket is just a temporary iteration, and will later be abandoned when more formalized code is written in apps/ and packages/ and services/

After the above work is complete, please check in with me and answer questions as follow-ons from the above work.