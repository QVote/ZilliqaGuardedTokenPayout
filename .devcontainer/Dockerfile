FROM zilliqa/scilla:latest

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get update
RUN apt-get install -y nodejs

# binaries are built but need to add them to path
ENV PATH="/scilla/0/bin:${PATH}"
