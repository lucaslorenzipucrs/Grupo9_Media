⸻

Revisão Crítica das Sugestões da IA e Decisões Humanas

Durante o desenvolvimento do projeto, as sugestões fornecidas pela Inteligência Artificial não foram aplicadas automaticamente. Todas as recomendações passaram por análise técnica da equipe, considerando requisitos do domínio, impacto arquitetural, esforço de implementação e aderência aos critérios de avaliação da disciplina.

Exemplo 1 – Diagnóstico do Problema de Autenticação JWT

Durante a integração entre os microsserviços de Auth e Media, a IA identificou corretamente uma inconsistência na configuração das variáveis de ambiente.

A análise apontou que:

* O microsserviço Auth gerava tokens utilizando o valor de JWT_SECRET definido no ambiente.
* O microsserviço Media não recebia essa variável.
* O Media utilizava o valor padrão dev-secret definido em seu settings.py.

A equipe revisou manualmente o diagnóstico, inspecionou os containers em execução e confirmou a divergência utilizando comandos Docker.

Somente após a validação manual foi realizada a alteração no docker-compose.yml, corrigindo o problema.

Esse episódio demonstrou que a IA foi utilizada como ferramenta de apoio à investigação, mas a validação da causa raiz e a decisão de correção permaneceram sob responsabilidade da equipe.

⸻

Exemplo 2 – Modelagem da Integração com S3

Durante a fase de integração com armazenamento de objetos, a IA sugeriu diferentes possibilidades de modelagem para o banco de dados, incluindo a criação de campos adicionais como:

* bucket_name
* content_type
* url pública do objeto

Após análise, a equipe decidiu não implementar essas alterações.

Os motivos foram:

* Não eram requisitos do domínio.
* Exigiriam alterações de schema e possível migração de banco.
* Aumentariam a complexidade sem benefício direto para os objetivos do trabalho.

Foi adotada uma solução mais simples e aderente ao contexto do projeto:

* O campo caminho_arquivo passou a armazenar apenas a Object Key do S3.
* O bucket permaneceu configurado por variável de ambiente.
* A URL do objeto pode ser derivada futuramente sem necessidade de persistência.

Essa decisão reduziu complexidade e risco de manutenção.

⸻

Exemplo 3 – Estratégia de Reordenação das Mídias

A IA auxiliou na definição das regras de validação da operação de reordenação.

Inicialmente foram consideradas abordagens mais permissivas, aceitando listas parciais de mídias.

Após discussão e análise da consistência dos dados, a equipe optou por uma estratégia mais restritiva:

* Todos os IDs do produto devem estar presentes no payload.
* Não são permitidos IDs duplicados.
* Não são permitidas ordens duplicadas.
* As posições devem formar uma sequência contínua iniciando em zero.

Essa decisão foi tomada para evitar estados inconsistentes e garantir integridade da ordenação.

As regras foram posteriormente implementadas e cobertas por testes automatizados.

⸻

Exemplo 4 – Estratégia de Testes Automatizados

A IA sugeriu diferentes abordagens para validação da integração com PostgreSQL e S3.

A equipe optou por não utilizar serviços externos reais durante os testes automatizados.

Foi adotada a seguinte estratégia:

* SQLite em memória para persistência temporária.
* Mock do StorageService para upload e remoção de objetos.
* Geração local de tokens JWT para autenticação.

Essa abordagem proporcionou:

* Execução rápida dos testes.
* Independência de infraestrutura externa.
* Reprodutibilidade em ambientes locais e GitHub Actions.

⸻

Conclusão

A Inteligência Artificial foi utilizada como ferramenta de apoio à engenharia de software, contribuindo para análise arquitetural, revisão de código, identificação de problemas, geração de testes e apoio à documentação.

Entretanto, todas as decisões relevantes foram avaliadas criticamente pela equipe antes de sua adoção.

Diversas sugestões foram revisadas, adaptadas ou simplificadas para melhor adequação aos requisitos do projeto, demonstrando uso consciente da IA como ferramenta de suporte e não como substituta do processo de engenharia.

A responsabilidade pelas decisões técnicas, validações, implementações e testes permaneceu integralmente sob responsabilidade da equipe.