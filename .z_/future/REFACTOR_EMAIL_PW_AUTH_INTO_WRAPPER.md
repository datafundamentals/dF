# Refactor Email Password Auth Into <df-auth-wrapper>

In this ticket, you will copy some existing UI code from where it currently lives temporarily, into another permanent location with an existing UI. 

This ticket is for writing intentionally non-standard anti-pattern code into a monorepo that relies heavily on standards and patterns, so you will need to pay special attention to the instructions within this document, which in some cases may over-ride other standards and patterns that are found within your context.

First, as primary guidance, please understand the purpose of the code that you will be moving, so that you can understand why it is nonstandard. This code is for developing a very non-standard, odd developer use case - which is when a developer is writing firebase functions triggered by firebase authentication, such as on create or on delete. This rare type of development is written with auth emulators turned on, and email password user creates are used to trigger firebase authentication.

What makes this non-standard is that this is code which is never deployed to real users, only developers doing function development.

For  a greater understanding of this, feel free to consult `.z_/future/refactor-teaching-apps-and-starter-template.md` but be warned it might give you a lot more information than you care to ingest.

Repeating what you may read elsewhere, the email password functionality that you will be installing into <df-auth-wrapper> should never be used by real users in real apps. It is for developers only, and in very narrowly prescribed development workflows.

The other question you hay have is, how are normal users prevented from using this functionality? The answer to this question is - <df-auth-wrapper> never shows this functionality except when called as <df-auth-wrapper emailPw></df-auth-wrapper> such that `emailPw` acts as a toggle to turn this on. This is similar to the `headless` toggle currently used to turn off another ui piece.

Please do not execute any of the work in this ticket if you are not confident and certain that you understand it properly.

Please give me every opportunity you can to double check you along the way. I don't wish to be unreasonable but if my instructions turn out to be unclear it is better to catch a problem early. It is also helpful to have frequent commits so we can ratchet progress on piece at a time.