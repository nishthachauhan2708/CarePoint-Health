FROM fluent/fluentd:v1.16-debian-1

USER root

# Install plugins if needed
RUN gem install fluent-plugin-record-modifier

COPY fluent.conf /fluentd/etc/fluent.conf

USER fluent

EXPOSE 24224

CMD ["fluentd", "-c", "/fluentd/etc/fluent.conf"]
