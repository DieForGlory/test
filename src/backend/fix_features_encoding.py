"""
Скрипт для исправления кодировки JSON в поле features и specs.
Пересохраняет данные с ensure_ascii=False
"""
from database import SessionLocal, Product
import json


def fix_encoding():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        print(f"Найдено {len(products)} товаров. Проверка кодировки...")

        count = 0
        for p in products:
            changed = False

            # 1. Исправляем Features
            if p.features:
                try:
                    # Загружаем JSON (он автоматически декодирует unicode escape)
                    data = json.loads(p.features)
                    # Пересохраняем в нормальном виде (читаемая кириллица)
                    new_json = json.dumps(data, ensure_ascii=False)

                    if p.features != new_json:
                        p.features = new_json
                        changed = True
                except:
                    print(f"Ошибка парсинга features у товара {p.name}")

            # 2. Исправляем Specs
            if p.specs:
                try:
                    data = json.loads(p.specs)
                    new_json = json.dumps(data, ensure_ascii=False)

                    if p.specs != new_json:
                        p.specs = new_json
                        changed = True
                except:
                    pass

            if changed:
                count += 1
                print(f"Исправлен: {p.name}")

        db.commit()
        print(f"\n✅ Готово! Исправлено товаров: {count}")

    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    fix_encoding()