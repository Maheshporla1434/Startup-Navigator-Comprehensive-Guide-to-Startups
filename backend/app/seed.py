import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, Base, engine
from backend.app.models import User, Category, Article, Resource, Document
from backend.app.security import get_password_hash
from backend.app.services.rag_service import index_document

def seed_db():
    db = SessionLocal()
    
    # Check if database is already seeded to protect user registrations
    if db.query(User).count() > 0 and db.query(Category).count() > 0:
        print("Database already contains seeded tables. Skipping default seeding to preserve registered user accounts.")
        db.close()
        return
        
    print("Database empty or partial. Running initial seeding...")
    
    # Clear any leftover records to prevent unique constraints errors
    db.query(User).delete()
    db.query(Category).delete()
    db.query(Article).delete()
    db.query(Resource).delete()
    db.query(Document).delete()
    db.commit()

    # 2. Seed Users
    admin_user = User(
        email="admin@startupnav.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Alex Administrator",
        role="admin"
    )
    test_user = User(
        email="user@startupnav.com",
        hashed_password=get_password_hash("UserPass123!"),
        full_name="Jane Founder",
        role="user"
    )
    db.add(admin_user)
    db.add(test_user)
    db.commit()
    print("Users seeded (admin@startupnav.com / user@startupnav.com)")

    # 3. Seed Categories
    funding_cat = Category(name="Funding & Equity", slug="funding", description="Capital structures, venture capital, and pitches")
    legal_cat = Category(name="Legal & Compliance", slug="legal", description="Incorporation, IP licensing, and compliance")
    marketing_cat = Category(name="Marketing & Growth", slug="marketing", description="SEO, acquisition, and growth loops")
    hiring_cat = Category(name="Hiring & Culture", slug="hiring", description="Team recruitment, values, and remote culture")
    branding_cat = Category(name="Branding & Design", slug="branding", description="Identity development, storytelling, and UI/UX values")
    
    db.add(funding_cat)
    db.add(legal_cat)
    db.add(marketing_cat)
    db.add(hiring_cat)
    db.add(branding_cat)
    db.commit()
    print("Categories seeded")

    # 4. Seed Articles
    art1 = Article(
        title="Demystifying Venture Capital: A Guide for First-Time Founders",
        slug="venture-capital-guide",
        content=(
            "Venture capital is a form of private equity and a type of financing that investors provide "
            "to startup companies and small businesses that are believed to have long-term growth potential. "
            "For first-time founders, understanding the venture capital pipeline is crucial. The pipeline typically "
            "starts with seed funding, followed by Series A, B, and C rounds. Seed funding is used to prove a "
            "concept, while Series A is used to build out the team and product. Series B and C are designed to scale "
            "the business rapidly. When pitch deck preparation is initiated, focus on the problem statement, "
            "market size, product-market fit, and team capability. Ensure you perform careful dilution calculations. "
            "A standard seed round may dilute founders by 15% to 25%. Understanding term sheets, specifically "
            "liquidation preferences, anti-dilution provisions, and board composition, is key to retaining control."
        ),
        summary="A guide explaining venture capital, funding rounds, dilution, and term sheets for first-time founders.",
        category_id=funding_cat.id,
        difficulty="beginner",
        reading_time=6
    )
    
    art2 = Article(
        title="Incorporating Your Startup: Delaware C-Corp vs. LLC",
        slug="startup-incorporation-guide",
        content=(
            "Choosing the right legal structure is one of the earliest and most critical decisions for a startup. "
            "The two primary structures are Delaware C-Corporation (C-Corp) and Limited Liability Company (LLC). "
            "For startups planning to raise venture capital, a Delaware C-Corp is the gold standard. VC funds "
            "prefer Delaware C-Corps because of the state's well-established corporate law, business-friendly courts, "
            "and standard structure for issuing stock options. An LLC offers greater flexibility and pass-through taxation, "
            "but makes it difficult to issue equity to employees or receive funding from institutions. When incorporating, "
            "founders should draft Articles of Incorporation, create Bylaws, and issue Founder Stock with standard "
            "4-year vesting schedules including a 1-year cliff to protect alignment."
        ),
        summary="Comparison between Delaware C-Corps and LLCs for venture-backed startups, including vesting guidelines.",
        category_id=legal_cat.id,
        difficulty="intermediate",
        reading_time=8
    )

    art3 = Article(
        title="Mastering Customer Acquisition Cost (CAC) and LTV",
        slug="cac-ltv-marketing-metrics",
        content=(
            "Customer Acquisition Cost (CAC) and Lifetime Value (LTV) are the lifeblood metrics of startup growth. "
            "CAC is calculated by dividing total sales and marketing expenses by the number of new customers acquired "
            "during a specific period. LTV is the total revenue a business can expect to earn from a single customer "
            "over the duration of their relationship. The golden rule for SaaS startups is maintaining an LTV:CAC ratio "
            "greater than 3:1. A lower ratio suggests that marketing spend is inefficient, while an excessively high ratio "
            "may indicate that you are under-investing in growth. Additionally, calculate the CAC Payback Period—the number "
            "of months required to recover the cost of acquiring a single customer. A healthy payback period is under 12 months."
        ),
        summary="Deep dive into computing and optimizing LTV, CAC, and payback periods for sustainable business growth.",
        category_id=marketing_cat.id,
        difficulty="advanced",
        reading_time=10
    )
    
    art4 = Article(
        title="Designing a Stock Option Plan for Early Employees",
        slug="stock-options-plan-early-employees",
        content=(
            "An Employee Stock Option Plan (ESOP) allows startups to attract top-tier talent by offering them fractional ownership "
            "in the business. At the seed stage, founders typically allocate 10% to 15% of the total company equity to an "
            "option pool. For early hires, equity allocation should reflect risk and contribution. First engineer hires might "
            "receive between 1% and 2%, while senior directors could get 0.5% to 1%. All option grants should use standard "
            "vesting: a 4-year term with a 1-year cliff. The cliff means that if an employee leaves before 12 months, they "
            "receive no equity. After the cliff, shares vest monthly (or quarterly) over the remaining 36 months."
        ),
        summary="How to construct an option pool, standard grant guidelines for early hires, and explanation of vesting clocks.",
        category_id=hiring_cat.id,
        difficulty="intermediate",
        reading_time=7
    )

    db.add(art1)
    db.add(art2)
    db.add(art3)
    db.add(art4)
    db.commit()
    print("Articles seeded")

    # 5. Seed Resources
    r1 = Resource(
        title="Delaware Division of Corporations",
        url="https://corp.delaware.gov",
        description="Official portal to file incorporation documents and pay annual franchise taxes in Delaware.",
        type="government"
    )
    r2 = Resource(
        title="Y Combinator Pitch Deck Template",
        url="https://www.ycombinator.com/library/2u-how-to-build-a-pitch-deck",
        description="Standard clean pitch deck template recommended by Y Combinator for seed-stage startups.",
        type="template"
    )
    r3 = Resource(
        title="SEC Edgar Search Portal",
        url="https://www.sec.gov/edgar",
        description="Access public financial records, fundraising filings (Form D), and regulatory reports.",
        type="government"
    )
    r4 = Resource(
        title="Startup Legal Bylaws Template",
        url="https://github.com/orrick/startup-forms",
        description="Open source repository of standard startup legal agreements, bylaws, and board resolutions.",
        type="template"
    )
    r5 = Resource(
        title="Techstars Accelerator Program",
        url="https://www.techstars.com/accelerators",
        description="Global startup accelerator providing mentoring, networking, and seed funding pathways.",
        type="incubator"
    )

    db.add(r1)
    db.add(r2)
    db.add(r3)
    db.add(r4)
    db.add(r5)
    db.commit()
    print("Resources seeded")

    # 6. Index Documents in Vector Search (for RAG)
    print("Indexing documents for RAG...")
    index_document(db, title="Delaware Corporation Filing Guidelines", content=(
        "To incorporate in Delaware, a startup must file a Certificate of Incorporation. This document lists the "
        "authorized shares (typically 10,000,000 shares for venture-track startups), par value (usually $0.00001), "
        "and registered agent info. The filing fee starts around $89. Annual franchise tax is computed via the Authorized "
        "Shares method or the Assumed Par Value Capital method. Most small startups use the Assumed Par Value method to "
        "keep taxes under $400/year instead of thousands of dollars under the Authorized Shares count method."
    ), source_url="https://corp.delaware.gov")

    index_document(db, title="Seed Stage Term Sheet Standard Terms", content=(
        "Seed stage terms sheets contain key provisions. First, Valuation: pre-money valuation defines startup pricing. "
        "Second, Liquidation Preference: 1x non-participating is the founder-friendly standard. Third, Board Seats: "
        "typically 3 seats (2 for founders, 1 for seed lead investor). Fourth, Protective Provisions: list of actions "
        "requiring investor consent (e.g., selling company or changing bylaws)."
    ), source_url="https://www.ycombinator.com/library")

    index_document(db, title="Customer Growth Loops and Channel Selection", content=(
        "Growth loops are closed systems where the input generates an output that feeds back into input. For example, "
        "User joins -> Invites friends -> Friends join -> Friends invite friends. Growth loops are far more sustainable "
        "than traditional linear marketing funnels. Channels like SEO, organic referrals, and content loops should "
        "scale over time. Keep user churn low by implementing solid onboarding guides and high performance metrics."
    ), source_url="https://growth.reforge.com")

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    # Ensure database exists before creating tables
    from backend.app.config import settings
    database_url = settings.DATABASE_URL
    
    if database_url.startswith("postgresql"):
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        try:
            base_url, db_name = database_url.rsplit('/', 1)
            if '?' in db_name:
                db_name, query_params = db_name.split('?', 1)
                postgres_url = f"{base_url}/postgres?{query_params}"
            else:
                postgres_url = f"{base_url}/postgres"
                
            conn = psycopg2.connect(postgres_url)
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            
            cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}';")
            exists = cursor.fetchone()
            if not exists:
                print(f"Database '{db_name}' does not exist on PostgreSQL server. Creating database...")
                cursor.execute(f"CREATE DATABASE {db_name};")
                print("Database created successfully!")
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Automatic database check warning: {e}")

    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    seed_db()
